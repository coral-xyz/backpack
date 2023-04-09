import { Children, memo } from 'react';
import PartnerCard from './Cards/PartnerCard';
import { partners } from '../constant';

function Partners() {
  return (
    <div className="backpack-container">
      <div className="mt-12 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
        {Children.toArray(partners.map(partner => <PartnerCard {...partner} />))}
      </div>
    </div>
  );
}

export default memo(Partners);
