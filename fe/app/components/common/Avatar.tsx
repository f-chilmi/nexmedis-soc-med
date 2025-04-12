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
    <div
      className="rounded-full flex items-center justify-center text-white font-bold"
      style={{
        width: "40px",
        height: "40px",
        backgroundColor: "#6B7280", // Default background color
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
