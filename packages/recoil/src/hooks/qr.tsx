import { useRecoilState } from "recoil";

import { qrScannerShowAtom } from "../atoms";

export function useQrScanner() {
  const [visible, setVisible] = useRecoilState(qrScannerShowAtom);
  return {
    visible,
    setVisible,
  };
}
