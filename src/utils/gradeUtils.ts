/**
 * Tiện ích tính toán và phân loại học lực.
 * Feature: missing-features-rbac
 */

export type GradeClassification =
  | 'Xuất sắc'
  | 'Giỏi'
  | 'Khá'
  | 'Trung bình'
  | 'Yếu'
  | 'Chưa có điểm';

/**
 * Phân loại học lực dựa trên điểm trung bình (thang 10).
 * - ≥ 9.0 → Xuất sắc
 * - ≥ 8.0 → Giỏi
 * - ≥ 6.5 → Khá
 * - ≥ 5.0 → Trung bình
 * - < 5.0 → Yếu
 * - null  → Chưa có điểm
 *
 * Validates: Yêu cầu 9.1, 9.3
 */
export function classifyGrade(average: number | null): GradeClassification {
  if (average === null) return 'Chưa có điểm';
  if (average >= 9.0) return 'Xuất sắc';
  if (average >= 8.0) return 'Giỏi';
  if (average >= 6.5) return 'Khá';
  if (average >= 5.0) return 'Trung bình';
  return 'Yếu';
}

/**
 * Tính điểm trung bình cộng, làm tròn 1 chữ số thập phân.
 * Trả về `null` nếu mảng rỗng.
 *
 * Validates: Yêu cầu 9.2
 */
export function calcAverage(scores: number[]): number | null {
  if (scores.length === 0) return null;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

interface MinimalGradeEntry {
  scoreType: string;
  title: string;
  score: number;
  is_na?: boolean;
}

interface MinimalGradeColumnConfig {
  id: string;
  name: string;
  weight: number;
  isBonus: boolean;
}

/**
 * Tính điểm trung bình có trọng số và cộng điểm thưởng.
 * Bỏ qua các đầu điểm vắng mặt N/A (is_na === true).
 * Cộng trực tiếp điểm thưởng từ cột isBonus === true.
 * Giới hạn điểm tối đa là 10.0 và làm tròn đến 1 chữ số thập phân.
 */
export function calcWeightedAverage(
  entries: MinimalGradeEntry[],
  configs: MinimalGradeColumnConfig[]
): number | null {
  const activeEntries = entries.filter(e => !e.is_na);
  if (activeEntries.length === 0) return null;

  let totalWeight = 0;
  let weightedSum = 0;
  let bonusSum = 0;

  activeEntries.forEach(entry => {
    // Tìm cấu hình cột phù hợp theo id (scoreType) hoặc tên cột trùng khớp với title
    const config = configs.find(
      c => c.id === entry.scoreType || c.name.toLowerCase() === entry.title.toLowerCase()
    );

    if (config) {
      if (config.isBonus) {
        bonusSum += entry.score;
      } else {
        weightedSum += entry.score * (config.weight / 100);
        totalWeight += config.weight / 100;
      }
    } else {
      // Nếu không có cấu hình, sử dụng trọng số mặc định dựa trên scoreType
      const defaultWeights: Record<string, number> = {
        oral: 10,
        quiz_15: 10,
        quiz_45: 20,
        homework: 10,
        midterm: 20,
        final: 30,
        assignment: 10,
      };
      const w = defaultWeights[entry.scoreType] ?? 10;
      weightedSum += entry.score * (w / 100);
      totalWeight += w / 100;
    }
  });

  if (totalWeight === 0) {
    return Math.round(Math.min(10, bonusSum) * 10) / 10;
  }

  const baseAverage = weightedSum / totalWeight;
  const finalScore = Math.min(10, baseAverage + bonusSum);
  return Math.round(finalScore * 10) / 10;
}

