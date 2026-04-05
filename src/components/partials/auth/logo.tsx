'use client'
import Image from 'next/image';
import { useTheme } from "next-themes";

const Logo = () => {
    const { theme: mode } = useTheme();
  return (
    <div>
      <Image
        src={
          mode === "light"
            ? "/images/logo/logo.svg"
            : "/images/logo/logo-white.svg"
        }
        alt=""
        width={300}
        height={300}
        className=" w-36 "
      />
    </div>
  );
}

export default Logo;