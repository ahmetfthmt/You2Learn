export type MasteryBadge = {
  id: "platinum" | "gold" | "silver" | "bronze" | "starter";
  name: string;
  shortLabel: string;
  minPercentage: number;
  description: string;
  celebration: string;
  accentClass: string;
};

const BADGES: MasteryBadge[] = [
  {
    id: "platinum",
    name: "Platin Ustalık Rozeti",
    shortLabel: "Platin Ustalık",
    minPercentage: 95,
    description: "Konuya olağanüstü düzeyde hâkimsiniz.",
    celebration: "Muhteşem! Konuya neredeyse kusursuz şekilde hâkim oldunuz.",
    accentClass: "from-slate-950 via-indigo-900 to-sky-700",
  },
  {
    id: "gold",
    name: "Altın Ustalık Rozeti",
    shortLabel: "Altın Ustalık",
    minPercentage: 85,
    description: "Konunun temel ve ileri kavramlarında güçlü bir yetkinlik gösterdiniz.",
    celebration: "Harika iş! Güçlü bir ustalık seviyesi sergilediniz.",
    accentClass: "from-amber-500 via-yellow-500 to-orange-500",
  },
  {
    id: "silver",
    name: "Gümüş Yetkinlik Rozeti",
    shortLabel: "Gümüş Yetkinlik",
    minPercentage: 70,
    description: "Sağlam bir kavrayış oluşturdunuz; birkaç tekrar sizi ustalığa taşır.",
    celebration: "Tebrikler! Konunun önemli bölümlerinde yetkinlik kazandınız.",
    accentClass: "from-slate-500 via-slate-400 to-slate-300",
  },
  {
    id: "bronze",
    name: "Bronz Gelişim Rozeti",
    shortLabel: "Bronz Gelişim",
    minPercentage: 50,
    description: "İyi bir temel oluşturdunuz; belirli alanları gözden geçirmek faydalı olur.",
    celebration: "İyi ilerleme! Öğrendiklerinizi pekiştirerek bir sonraki seviyeye geçebilirsiniz.",
    accentClass: "from-orange-800 via-amber-700 to-orange-600",
  },
  {
    id: "starter",
    name: "Öğrenme Yolculuğu Rozeti",
    shortLabel: "Öğrenme Yolculuğu",
    minPercentage: 0,
    description: "Sınavı tamamladınız; hedefli tekrarlarla bilginizi güçlendirebilirsiniz.",
    celebration: "Sınavı tamamladınız. Her doğru yanıt, ustalığa giden yolun bir parçasıdır.",
    accentClass: "from-indigo-600 via-violet-600 to-fuchsia-600",
  },
];

export function getMasteryBadge(score: number, totalQuestions: number): MasteryBadge {
  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
  return BADGES.find((badge) => percentage >= badge.minPercentage) ?? BADGES[BADGES.length - 1];
}

export function getMasteryPercentage(score: number, totalQuestions: number) {
  return totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
}
