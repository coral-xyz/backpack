/* eslint-disable max-len */
const HeroSection = ({
  title,
  children
}: {
  title: JSX.Element;
  children?: JSX.Element | JSX.Element[];
}) => {
  return (
    <section className="relative">
      <div
        aria-hidden="true"
        className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
      >
        <div className="h-56 bg-gradient-to-br from-primary to-primary blur-[106px] dark:from-primary"></div>
        <div className="from-primary-400 h-32 bg-gradient-to-r to-primary blur-[106px] dark:to-primary"></div>
      </div>
      <div className="backpack-container">
        <div className="relative ml-auto pt-36">
          <div className="mx-auto text-center lg:w-2/3">
            <h1 className="mb-8 text-5xl font-bold text-gray-900 dark:text-white md:text-6xl xl:text-7xl">
              {title}
            </h1>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
