import Image from "next/image";

const Avatar = ({
  username,
  profilePicture,
}: {
  username: string;
  profilePicture?: string;
}) => {
  if (profilePicture) {
    return (
      <Image
        src={profilePicture}
        alt={username}
        width={40}
        height={40}
        className="rounded-full"
      />
    );
  }

  const initials = username
    ? username
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
    : "??"; // Default if username is missing

  return (
    <div className="rounded-full flex items-center justify-center text-white text-2xl font-semibold w-[40px] h-[40px] bg-[#6B7280]">
      {initials}
    </div>
  );
};

export default Avatar;
