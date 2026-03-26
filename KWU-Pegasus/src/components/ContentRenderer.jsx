export default function ContentRenderer({ content }) {
  return content.split('\n').map((line, i) =>
    line === '' ? <br key={i} /> : <p key={i}>{line}</p>
  )
}
