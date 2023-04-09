type HeroFeatureCardType = {
  title: string;
  description: string;
};

const HeroFeatureCard = ({ title, description }: HeroFeatureCardType) => {
  return (
    <div className="text-left">
      <h6 className="text-lg font-semibold text-gray-700 dark:text-white">{title}</h6>
      <p className="mt-2 text-gray-500">{description}</p>
    </div>
  );
};

export default HeroFeatureCard;
