interface StallNameProps {
  name: string;
  fontSize?: number;
  fontWeight?: number;
}

export default function StallName({ name, fontSize = 16, fontWeight = 700 }: StallNameProps) {
  const [first, ...rest] = name.split(' ');
  return (
    <span style={{ fontSize, fontWeight, lineHeight: 1 }}>
      <span style={{ color: '#ffffff' }}>{first}</span>
      {rest.length > 0 && (
        <span style={{ color: 'var(--accent-color, #C0392B)' }}> {rest.join(' ')}</span>
      )}
    </span>
  );
}
