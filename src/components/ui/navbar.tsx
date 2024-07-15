import { Github, Linkedin } from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";

const IconContainer = ({
  children,
  title = "",
  onClick = () => {},
}: {
  children: ReactNode;
  title: string;
  onClick?: () => void;
}) => {
  return (
    <>
      <div
        onClick={onClick}
        className="px-4 rounded-xl py-1 flex flex-row gap-2 bg-primaryBtn text-white items-center cursor-pointer"
      >
        <p className="hidden md:block text-sm">{title}</p>
        {children}
      </div>
    </>
  );
};

const Navbar = () => {
  return (
    <div className="w-full overflow-hidden px-7 lg:px-10 bg-[#191919] flex flex-row items-center justify-between">
      <div className="">
        <Image
          alt="logo"
          src={require("@/assets/image/logo_with_name.png")}
          className="w-48 h-14 md:h-20 md:w-56"
        />
      </div>
      <div className="flex flex-row gap-10 text-newAccent items-center">
        <p className="hidden md:block font-comic-neue font-bold text-lg">
          follow me on
        </p>
        <div className="flex flex-row items-center gap-6">
          <IconContainer
            title="Github"
            onClick={() => {
              window.open("https://github.com/nilu2039", "_blank");
            }}
          >
            <Github className="size-5" />
          </IconContainer>
          <IconContainer
            title="Linkedin"
            onClick={() => {
              window.open(
                "https://www.linkedin.com/in/nilanjan-mandal-a825961bb/",
                "_blank"
              );
            }}
          >
            <Linkedin className="size-5" />
          </IconContainer>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
