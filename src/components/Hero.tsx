import { createSignal, type Component } from 'solid-js';
import Nav from './Nav';
import ArrowCircle from './ArrowCircle';

const promises = [
  {
    icon: '/assets/promise-1.avif',
    title: 'One permanent read',
    body: 'A single whole-genome sequence. No re-testing the same sample.',
  },
  {
    icon: '/assets/promise-2.avif',
    title: 'Decisions, not findings',
    body: 'The few choices where your biology changes the answer.',
  },
  {
    icon: '/assets/promise-3.avif',
    title: 'Re-read as science moves',
    body: 'Your sequence stays fixed. What we can learn from it doesn’t.',
  },
];

const Hero: Component = () => {
  const [joined, setJoined] = createSignal(false);

  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    setJoined(true);
  };

  return (
    <header class="hero" id="top">
      <div class="hero__portrait" />
      <div class="hero__scrim" />

      <Nav />

      <h1 class="hero__headline" data-split>
        {`Sequenced once.\nUsed for life.`}
      </h1>

      <div class="hero__lower">
        <div class="promises">
          {promises.map((p, i) => (
            <div
              class="promise"
              data-reveal
              style={{ 'transition-delay': `${i * 110}ms` }}
            >
              <div class="promise__icon-wrap">
                <img class="promise__icon" src={p.icon} alt="" />
              </div>
              <div>
                <div class="promise__title">{p.title}</div>
                <div class="promise__body">{p.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div class="waitlist" id="join" data-reveal="scale">
          <div class="waitlist__statement">
            Your genome already holds the answers — we help you act on them.
          </div>

          {joined() ? (
            <div class="waitlist__note" style={{ color: '#fff', 'font-size': '18px' }}>
              You're on the list. We'll be in touch.
            </div>
          ) : (
            <form class="waitlist__form" onSubmit={submit}>
              <div class="waitlist__input-wrap">
                <input
                  class="waitlist__input"
                  type="email"
                  required
                  placeholder="Email address"
                  aria-label="Email address"
                />
              </div>
              <button class="waitlist__submit" type="submit">
                <span>Join Waitlist</span>
                <ArrowCircle dark />
              </button>
            </form>
          )}

          <div class="waitlist__note">
            No spam. Occasional notes on what we’re learning.
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
