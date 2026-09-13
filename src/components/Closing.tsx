import { createSignal, type Component } from 'solid-js';
import ArrowCircle from './ArrowCircle';
import Logo from './Logo';

const Closing: Component = () => {
  const [joined, setJoined] = createSignal(false);

  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    setJoined(true);
  };

  return (
    <footer class="closing">
      <div class="closing__eyebrow mono-label" data-reveal>
        THE NEXT CHAPTER OF PERSONALISED HEALTH
      </div>

      <h2 class="closing__headline" data-split>
        {`Your biology.\nA better starting point.`}
      </h2>

      <div class="closing__row">
        <div class="closing__text">
          We’re building Omen. Join the early community helping shape what comes
          next.
        </div>

        {joined() ? (
          <div class="closing__text" style={{ color: '#fff' }}>
            You're on the list. We'll be in touch.
          </div>
        ) : (
          <div class="closing__form-col">
            <form class="closing__form" onSubmit={submit}>
              <input
                class="closing__input"
                type="email"
                required
                placeholder="Your email address"
                aria-label="Your email address"
              />
              <button class="closing__submit" type="submit">
                <span>Join Waitlist</span>
                <ArrowCircle />
              </button>
            </form>
            <div class="closing__note">
              No spam. Occasional notes on what we’re learning.
            </div>
          </div>
        )}
      </div>

      <div class="closing__footer">
        <div class="closing__footer-top">
          <span class="closing__footer-logo">
            <Logo />
          </span>
          <a class="closing__footer-privacy-mobile" href="#privacy">
            Privacy
          </a>
        </div>
        <span class="closing__footer-left">
          <span class="closing__cities-desktop">
            {'London  |  New York  |  Bangalore'}
          </span>
          <span class="closing__cities-mobile">
            {'London  |  New York  |  Bangalore'}
          </span>
        </span>
        <span class="closing__footer-center">© Omen Division</span>
        <a class="closing__footer-right" href="#privacy">
          Privacy
        </a>
      </div>
    </footer>
  );
};

export default Closing;
