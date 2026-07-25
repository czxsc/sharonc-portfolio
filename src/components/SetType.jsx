/* ------------------------------------------------------------------
   Type that sets itself.

   Each line sits in its own overflow mask and rises out from behind
   its baseline when the block scrolls in. Masking per line — rather
   than fading the whole heading — is what makes it read as type being
   set instead of a box being moved, and it's the one entrance move
   used for every title on the site so the rhythm stays recognisable.

   Lines are declared, not measured: the copy is ours, so where a
   headline breaks is a typographic decision, not something to leave
   to the layout engine.
   ------------------------------------------------------------------ */
export default function SetType({
  as: Tag = 'span',
  lines,
  className = '',
  ...rest
}) {
  const arr = Array.isArray(lines) ? lines : [lines];
  return (
    <Tag className={`set ${className}`.trim()} {...rest}>
      {arr.map((line, i) => (
        <span key={i} className="set-line" style={{ '--i': i }}>
          <span className="set-line-in">{line}</span>
        </span>
      ))}
    </Tag>
  );
}
