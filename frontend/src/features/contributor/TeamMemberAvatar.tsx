import { cn, generateColorFromString, hexToRgb, type TeamMember } from '@/lib/utils';

type TeamMemberAvatarProps = {
  member: TeamMember;
  profilePictureUrl?: string;
  fallbackText: string;
  className?: string;
  imageClassName?: string;
};

function getAvatarStyle(username: string) {
  const hex = generateColorFromString(username);
  const { r, g, b } = hexToRgb(hex);
  const darkR = Math.round(r * 0.55);
  const darkG = Math.round(g * 0.55);
  const darkB = Math.round(b * 0.55);

  return {
    backgroundColor: `rgb(${darkR}, ${darkG}, ${darkB})`,
    color: '#ffffff',
  };
}

export default function TeamMemberAvatar({
  member,
  profilePictureUrl,
  fallbackText,
  className,
  imageClassName,
}: TeamMemberAvatarProps) {
  if (profilePictureUrl) {
    return (
      <img
        src={profilePictureUrl}
        alt={member.username}
        className={cn(
          'rounded-full object-cover',
          className,
          imageClassName,
        )}
        title={member.username}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold text-white',
        className,
      )}
      style={getAvatarStyle(member.username)}
      title={member.username}
    >
      {fallbackText}
    </span>
  );
}
