export const calculateMasteryProgressFL = (cards) => {
  if (!cards || cards.length === 0) return 0;

  const difficultyTarget = {
    easy: 3,
    medium: 6,
    hard: 9,
  };

  let totalProgress = 0;

  cards.forEach((card) => {
    const target = difficultyTarget[card.difficulty] || 5;

    const progress = Math.min((card.reviewCount || 0) / target, 1);

    totalProgress += progress;
  });

  const mastery = (totalProgress / cards.length) * 100;

  return Math.round(mastery);
};
