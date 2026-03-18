import styles from './Home.module.css'

export default function Home() {
  return (
    <section className={styles.home}>
      <div className={styles.heroImageWrapper}>
        <img className={styles.heroImage} src="/main.jpg" alt="메인 이미지" />
      </div>
      <div className={`${styles.longText} text`}>
        <p>이것은 스크롤바 테스트를 위해 추가된 긴 텍스트입니다. 아래 내용을 반복하면서 충분히 길게 만들어 홈 페이지가 스크롤 가능한지 확인합니다.</p>
        <p>첫 번째 문단입니다. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec at ex at odio tincidunt aliquam. Curabitur nec purus quis risus auctor tempor. Praesent nec ligula id eros elementum vestibulum id in massa.</p>
        <p>두 번째 문단입니다. Nullam quis vestibulum augue. Suspendisse non lorem vel velit efficitur malesuada. Maecenas vitae dignissim urna. Nunc malesuada sollicitudin dui, sed sollicitudin odio vulputate sed.</p>
        <p>세 번째 문단입니다. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer id orci scelerisque, imperdiet mi ac, pulvinar augue. Vivamus mattis felis eu tortor feugiat lacinia.</p>
        <p>네 번째 문단입니다. Fusce ac mauris ut ante fermentum hendrerit ut eget lacus. Aliquam erat volutpat. Sed et libero ligula. Praesent et vestibulum magna.</p>
        <p>다섯 번째 문단입니다. Pellentesque ac arcu ac odio dignissim interdum. Nulla facilisi. Integer vel mollis erat, eu pharetra massa. Curabitur egestas ullamcorper bibendum.</p>
      </div>
      <div className={`${styles.longText} text`}>
        <p>이것은 스크롤바 테스트를 위해 추가된 긴 텍스트입니다. 아래 내용을 반복하면서 충분히 길게 만들어 홈 페이지가 스크롤 가능한지 확인합니다.</p>
        <p>첫 번째 문단입니다. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec at ex at odio tincidunt aliquam. Curabitur nec purus quis risus auctor tempor. Praesent nec ligula id eros elementum vestibulum id in massa.</p>
        <p>두 번째 문단입니다. Nullam quis vestibulum augue. Suspendisse non lorem vel velit efficitur malesuada. Maecenas vitae dignissim urna. Nunc malesuada sollicitudin dui, sed sollicitudin odio vulputate sed.</p>
        <p>세 번째 문단입니다. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer id orci scelerisque, imperdiet mi ac, pulvinar augue. Vivamus mattis felis eu tortor feugiat lacinia.</p>
        <p>네 번째 문단입니다. Fusce ac mauris ut ante fermentum hendrerit ut eget lacus. Aliquam erat volutpat. Sed et libero ligula. Praesent et vestibulum magna.</p>
        <p>다섯 번째 문단입니다. Pellentesque ac arcu ac odio dignissim interdum. Nulla facilisi. Integer vel mollis erat, eu pharetra massa. Curabitur egestas ullamcorper bibendum.</p>
      </div>
      <div className={`${styles.longText} text`}>
        <p>이것은 스크롤바 테스트를 위해 추가된 긴 텍스트입니다. 아래 내용을 반복하면서 충분히 길게 만들어 홈 페이지가 스크롤 가능한지 확인합니다.</p>
        <p>첫 번째 문단입니다. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec at ex at odio tincidunt aliquam. Curabitur nec purus quis risus auctor tempor. Praesent nec ligula id eros elementum vestibulum id in massa.</p>
        <p>두 번째 문단입니다. Nullam quis vestibulum augue. Suspendisse non lorem vel velit efficitur malesuada. Maecenas vitae dignissim urna. Nunc malesuada sollicitudin dui, sed sollicitudin odio vulputate sed.</p>
        <p>세 번째 문단입니다. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer id orci scelerisque, imperdiet mi ac, pulvinar augue. Vivamus mattis felis eu tortor feugiat lacinia.</p>
        <p>네 번째 문단입니다. Fusce ac mauris ut ante fermentum hendrerit ut eget lacus. Aliquam erat volutpat. Sed et libero ligula. Praesent et vestibulum magna.</p>
        <p>다섯 번째 문단입니다. Pellentesque ac arcu ac odio dignissim interdum. Nulla facilisi. Integer vel mollis erat, eu pharetra massa. Curabitur egestas ullamcorper bibendum.</p>
      </div>
    </section>
  )
}
