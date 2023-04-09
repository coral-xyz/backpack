/* eslint-disable max-len */
import Link from 'next/link';
import { HeroSection } from '../components';

export default function Terms() {
  return (
    <HeroSection
      title={
        <>
          Privacy <span className="dark:text-text-primary text-primary">Policy</span>
        </>
      }
    >
      <div className="terms-and-privacy-styling">
        <h1>This is a Heading h1</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam incidunt ea aperiam quidem,
          consequatur cum provident aut quibusdam est, vitae deleniti commodi saepe! Laborum, porro!
          Dolor voluptatem consectetur veniam doloremque?
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam incidunt ea aperiam quidem,
          consequatur cum provident aut quibusdam est, vitae deleniti commodi saepe! Laborum, porro!
          Dolor voluptatem consectetur veniam doloremque?
        </p>
        <h1>This is a Heading h1</h1>
        <p>
          <a href="#">Lorem ipsum dolor</a> sit amet consectetur adipisicing elit. Nam incidunt ea
          aperiam quidem, consequatur cum provident aut quibusdam est, vitae deleniti commodi saepe!
          Laborum, porro! Dolor voluptatem consectetur veniam doloremque?
        </p>
        <h2>This is a Heading h1</h2>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam incidunt ea aperiam quidem,
          consequatur cum provident aut quibusdam est, vitae deleniti commodi saepe! Laborum, porro!
          Dolor voluptatem consectetur veniam doloremque?
        </p>
        <h3>This is a Heading h3</h3>
        <p>
          <Link href="#">Lorem ipsum dolor</Link> sit amet consectetur adipisicing elit. Nam
          incidunt ea aperiam quidem, consequatur cum provident aut quibusdam est, vitae deleniti
          commodi saepe! Laborum, porro! Dolor voluptatem consectetur veniam doloremque?
        </p>
        <h4>This is a Heading h4</h4>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam incidunt ea aperiam quidem,
          consequatur cum provident aut quibusdam est, vitae deleniti commodi saepe! Laborum, porro!
          Dolor voluptatem consectetur veniam doloremque?
        </p>
        <h5>This is a Heading h5</h5>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam incidunt ea aperiam quidem,
          consequatur cum provident aut quibusdam est, vitae deleniti commodi saepe! Laborum, porro!
          Dolor voluptatem consectetur veniam doloremque?
        </p>
        <h6>This is a Heading h6</h6>
        <p>
          Lorem ipsum dolor sit amet commodi saepe! Laborum, porro! Dolor voluptatem consectetur
          veniam doloremque?
        </p>
      </div>
    </HeroSection>
  );
}
