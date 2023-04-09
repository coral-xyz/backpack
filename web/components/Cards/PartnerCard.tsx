/* eslint-disable max-len */
import Image from 'next/image';
import Link from 'next/link';

type PartnerType = {
  image: string;
  url: string;
};

const PartnerCard = ({ image, url }: PartnerType) => {
  return (
    <Link
      href={url}
      className="p-4 brightness-50 grayscale transition duration-200 hover:brightness-0 hover:grayscale-0 dark:brightness-100 dark:hover:brightness-100"
    >
      <Image
        src={image}
        className="mx-auto h-12 w-auto"
        loading="lazy"
        alt="client logo"
        width={50}
        height={50}
      />
    </Link>
  );
};

export default PartnerCard;
