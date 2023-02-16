import { useBarterContext } from "./BarterContext";

export const AddAssetsCard = () => {
  const { setSelectNft } = useBarterContext();
  return (
    <div
      onClick={() => {
        setSelectNft(true);
      }}
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        width: 200,
        height: 200,
      }}
    >
      + Add assets
    </div>
  );
};
