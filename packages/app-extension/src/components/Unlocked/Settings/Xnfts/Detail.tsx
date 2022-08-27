export const XnftDetail: React.FC<{ xnft: any }> = ({ xnft }) => {
  console.log("XNF TDETASIL HERE", xnft);
  return <div>{xnft.title}</div>;
};
