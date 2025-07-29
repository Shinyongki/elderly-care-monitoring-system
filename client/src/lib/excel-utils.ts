import * as XLSX from 'xlsx';
import type { OfficialSurvey, ElderlySurvey, InventoryDistribution } from '@shared/schema';

export interface ExcelRow {
  [key: string]: any;
}

export class ExcelProcessor {
  static async readFile(file: File): Promise<ExcelRow[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          if (file.name.toLowerCase().endsWith('.csv')) {
            // CSV 파일 처리
            const text = e.target?.result as string;
            const workbook = XLSX.read(text, { type: 'string' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData);
          } else {
            // Excel 파일 처리
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData);
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('파일 읽기 실패'));

      if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsText(file, 'utf-8');
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }

  static validateOfficialSurveyData(data: ExcelRow[]): {
    valid: boolean;
    errors: string[];
    validRows: number;
  } {
    const errors: string[] = [];
    let validRows = 0;

    // CSV 파일의 실제 컬럼명에 맞게 매핑
    const fieldMapping: { [key: string]: string[] } = {
      '소속': ['1. 귀하의 소속은 어디입니까?', '소속'],
      '직위': ['2. 귀하의 직위/역할은 무엇입니까?', '직위'],
      '경력': ['3. 현재 업무 경력은 얼마나 됩니까?', '경력'],
      '필요성': ['4. 귀하가 근무하시는 지역의 노인돌봄 서비스 필요성에 대해 어떻게 생각하십니까?', '필요성'],
      '충분성': ['5. 현재 지역 내 노인돌봄 서비스가 충분히 제공되고 있다고 생각하십니까?', '충분성'],
      '필요서비스': ['6. 지역 어르신들이 가장 필요로 하는 서비스는 무엇이라고 생각하십니까? (최대 2개 선택)', '필요서비스'],
      '가장큰효과': ['7. 노인돌봄 서비스의 가장 큰 효과는 무엇이라고 생각하십니까?', '가장큰효과'],
      '가장큰문제점': ['8. 현재 노인돌봄 서비스 제공에서 가장 큰 문제점은 무엇입니까?', '가장큰문제점'],
      '개선우선순위': ['9. 노인돌봄 서비스 개선을 위해 가장 우선적으로 필요한 것은 무엇입니까?', '개선우선순위'],
      '인지도': ['10. 인지도', '인지도']
    };

    // 실제 CSV에 있는 필수 필드만 검증 (인지도, 개선우선순위는 선택적)
    const requiredFields = ['소속', '직위', '경력', '필요성', '충분성', '필요서비스', '가장큰효과', '가장큰문제점'];

    // 실제 데이터에서 사용할 컬럼명 찾기
    const getFieldValue = (row: ExcelRow, fieldKey: string): string => {
      const possibleNames = fieldMapping[fieldKey] || [];
      for (const name of possibleNames) {
        if (row[name] !== undefined && row[name] !== null) {
          return row[name].toString().trim();
        }
      }
      return '';
    };

    data.forEach((row, index) => {
      const rowNumber = index + 2; // Excel row number (header is row 1)
      let rowValid = true;

      requiredFields.forEach(field => {
        const value = getFieldValue(row, field);
        if (!value) {
          errors.push(`행 ${rowNumber}: '${field}' 필드가 비어있습니다.`);
          rowValid = false;
        }
      });

      if (rowValid) validRows++;
    });

    return {
      valid: errors.length === 0,
      errors,
      validRows,
    };
  }

  static convertToOfficialSurveys(data: ExcelRow[]): OfficialSurvey[] {
    const getFieldValue = (row: ExcelRow, fieldKey: string): string => {
      const fieldMapping: { [key: string]: string[] } = {
        '소속': ['1. 귀하의 소속은 어디입니까?', '소속'],
        '직위': ['2. 귀하의 직위/역할은 무엇입니까?', '직위'],
        '경력': ['3. 현재 업무 경력은 얼마나 됩니까?', '경력'],
        '필요성': ['4. 귀하가 근무하시는 지역의 노인돌봄 서비스 필요성에 대해 어떻게 생각하십니까?', '필요성'],
        '충분성': ['5. 현재 지역 내 노인돌봄 서비스가 충분히 제공되고 있다고 생각하십니까?', '충분성'],
        '필요서비스': ['6. 지역 어르신들이 가장 필요로 하는 서비스는 무엇이라고 생각하십니까? (최대 2개 선택)', '필요서비스'],
        '가장큰효과': ['7. 노인돌봄 서비스의 가장 큰 효과는 무엇이라고 생각하십니까?', '가장큰효과'],
        '가장큰문제점': ['8. 현재 노인돌봄 서비스 제공에서 가장 큰 문제점은 무엇입니까?', '가장큰문제점'],
        '개선우선순위': ['9. 노인돌봄 서비스 개선을 위해 가장 우선적으로 필요한 것은 무엇입니까?', '개선우선순위'],
        '인지도': ['10. 인지도', '인지도']
      };

      const possibleNames = fieldMapping[fieldKey];
      for (const name of possibleNames) {
        if (row[name] !== undefined && row[name] !== null) {
          return row[name].toString().trim();
        }
      }
      return '';
    };

    return data.map((row, index) => ({
      id: `official-${Date.now()}-${index}`,
      department: getFieldValue(row, '소속'),
      position: getFieldValue(row, '직위'),
      experience: getFieldValue(row, '경력'),
      necessity: (() => {
        const value = getFieldValue(row, '필요성');
        const num = Number(value);
        if (!isNaN(num) && num >= 1 && num <= 5) return num;

        // 텍스트 값을 숫자로 변환
        const textValue = value.toLowerCase().trim();
        if (textValue === '매우 필요') return 5;
        if (textValue === '필요') return 4;
        if (textValue === '보통') return 3;
        if (textValue === '불필요') return 2;
        if (textValue === '매우 불필요') return 1;
        return 0;
      })(),
      sufficiency: (() => {
        const value = getFieldValue(row, '충분성');
        const num = Number(value);
        if (!isNaN(num) && num >= 1 && num <= 5) return num;

        // 텍스트 값을 숫자로 변환
        const textValue = value.toLowerCase().trim();
        if (textValue === '매우 충분') return 5;
        if (textValue === '충분') return 4;
        if (textValue === '보통') return 3;
        if (textValue === '부족') return 2;
        if (textValue === '매우 부족') return 1;
        return 0;
      })(),
      neededServices: getFieldValue(row, '필요서비스') ? getFieldValue(row, '필요서비스').split(',').map((s: string) => s.trim()).slice(0, 2) : [],
      effect: getFieldValue(row, '가장큰효과'),
      problem: getFieldValue(row, '가장큰문제점'),
      priority: getFieldValue(row, '개선우선순위'),
      knowledge: (() => {
        const value = getFieldValue(row, '인지도');
        // 빈 값이나 공백만 있는 경우만 '확인불가'로 처리
        if (!value || value.trim() === '') {
          return '확인불가';
        }
        // CSV에서는 이미 텍스트로 되어 있으므로 그대로 반환
        return value.toString().trim();
      })(),
      description: '',
      createdAt: new Date(),
    }));
  }

  static exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1'): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  static exportOfficialSurveys(surveys: OfficialSurvey[]): void {
    const data = surveys.map(survey => ({
      '소속': survey.department,
      '직위': survey.position,
      '경력': survey.experience,
      '필요성': survey.necessity,
      '충분성': survey.sufficiency,
      '필요서비스': survey.neededServices.join(', '),
      '가장큰효과': survey.effect,
      '가장큰문제점': survey.problem,
      '개선우선순위': survey.priority,
      '인지도': survey.knowledge,
      '서비스설명': survey.description || '',
      '등록일': survey.createdAt.toLocaleDateString('ko-KR'),
    }));

    this.exportToExcel(data, `공무원설문_${new Date().toISOString().split('T')[0]}`, '공무원설문');
  }

  static exportElderlySurveys(surveys: ElderlySurvey[]): void {
    const data = surveys.map(survey => ({
      '이름': survey.name,
      '성별': survey.gender === 'male' ? '남성' : '여성',
      '연령': survey.age,
      '거주지역': survey.residence,
      '이용기간': survey.serviceMonths,
      '돌봄유형': survey.careType === 'general' ? '일반돌봄' : survey.careType === 'intensive' ? '중점돌봄' : '특화돌봄',
      '방문기관': survey.organization,
      '안전확인_이용': survey.serviceUsage.safety.usage,
      '안전확인_만족도': survey.serviceUsage.safety.satisfaction,
      '사회참여_이용': survey.serviceUsage.social.usage,
      '사회참여_만족도': survey.serviceUsage.social.satisfaction,
      '생활교육_이용': survey.serviceUsage.education.usage,
      '생활교육_만족도': survey.serviceUsage.education.satisfaction,
      '일상생활지원_이용': survey.serviceUsage.daily.usage,
      '일상생활지원_만족도': survey.serviceUsage.daily.satisfaction,
      '연계서비스_이용': survey.serviceUsage.linkage.usage,
      '연계서비스_만족도': survey.serviceUsage.linkage.satisfaction,
      '전체만족도': survey.overallEvaluation.overallSatisfaction,
      '생활만족도': survey.lifeChanges.lifeSatisfaction,
      '등록일': survey.createdAt.toLocaleDateString('ko-KR'),
    }));

    this.exportToExcel(data, `어르신설문_${new Date().toISOString().split('T')[0]}`, '어르신설문');
  }

  static exportInventoryDistributions(distributions: InventoryDistribution[]): void {
    const data = distributions.map(dist => ({
      '반출일자': dist.date.toLocaleDateString('ko-KR'),
      '방문기관': dist.organization,
      '담당자': dist.contact,
      '연락처': dist.phone,
      '참여어르신': dist.elderly,
      '참여종사자': dist.staff,
      '반출수량': dist.distributed,
      '수령확인자': dist.signature,
      '비고': dist.notes || '',
      '등록일': dist.createdAt.toLocaleDateString('ko-KR'),
    }));

    this.exportToExcel(data, `물품반출기록_${new Date().toISOString().split('T')[0]}`, '물품반출');
  }

  static downloadOfficialSurveyTemplate(): void {
    const templateData = [
      {
        '소속': '예시구청',
        '직위': '주무관',
        '경력': '5년',
        '필요성': 4,
        '충분성': 3,
        '필요서비스': '안전확인, 생활지원',
        '가장큰효과': '어르신 안전 확보',
        '가장큰문제점': '인력 부족',
        '개선우선순위': '전문인력 확충',
        '인지도': '높음',
        '서비스설명': '노인맞춤돌봄서비스는...'
      },
      {
        '소속': '',
        '직위': '',
        '경력': '',
        '필요성': '',
        '충분성': '',
        '필요서비스': '',
        '가장큰효과': '',
        '가장큰문제점': '',
        '개선우선순위': '',
        '인지도': '',
        '서비스설명': ''
      }
    ];

    this.exportToExcel(templateData, '공무원설문_템플릿', '공무원설문');
  }
}

export default ExcelProcessor;