/* eslint-disable max-len */
import Image from 'next/image';
import Link from 'next/link';

type BlogCardType = {
  title: string;
  subtitle: string;
  image: string;
  href: string;
};

const BlogCard = ({ title, subtitle, image, href }: BlogCardType) => {
  return (
    <div className="shadow-2xn border-zimc-100 group rounded-3xl border bg-white bg-opacity-50 p-6 shadow-zinc-600/10 dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-none sm:p-8">
      <div className="relative overflow-hidden rounded-xl">
        <Image
          src={image}
          alt={title}
          loading="lazy"
          width="1000"
          height="667"
          className="h-64 w-full object-cover object-top transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="relative mt-6">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">{title}</h3>
        <p className="mt-6 mb-8 text-gray-600 dark:text-gray-300">{subtitle}</p>
        <Link className="inline-block" href={href} target="_blank">
          <span className="text-info dark:text-red-300">Read more</span>
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;
