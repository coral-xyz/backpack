export const CameraOn = ({ fill }: { fill?: string }) => {
  return (
    <div style={{ width: 20 }}>
      <svg
        width="50"
        height="32"
        viewBox="0 0 49 32"
        fill={fill || "none"}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M37.6666 12V2.66667C37.6666 1.2 36.4666 0 34.9999 0H2.99992C1.53325 0 0.333252 1.2 0.333252 2.66667V29.3333C0.333252 30.8 1.53325 32 2.99992 32H34.9999C36.4666 32 37.6666 30.8 37.6666 29.3333V20L48.3333 30.6667V1.33333L37.6666 12Z"
          fill={fill || "8F929E"}
        />
      </svg>
    </div>
  );
};
