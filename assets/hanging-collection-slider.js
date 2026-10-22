if (!customElements.get('hanging-collection-slider')) {
  customElements.define('hanging-collection-slider', class extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;
      this.controller = new AbortController();
      const options = { signal: this.controller.signal };
      this.track = this.querySelector('.hanging-rail__track');
      this.items = [...this.querySelectorAll('.hanging-rail__item')];
      this.previous = this.querySelector('[data-rail-prev]');
      this.next = this.querySelector('[data-rail-next]');
      if (!this.track || !this.items.length) return;
      const move = (direction) => {
        const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
        this.track.scrollBy({ left: direction * (this.items[0].offsetWidth + gap), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      };
      this.previous.addEventListener('click', () => move(-1), options);
      this.next.addEventListener('click', () => move(1), options);
      this.track.addEventListener('scroll', () => {
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => this.update());
      }, { ...options, passive: true });
      this.items.forEach((item) => {
        item.querySelector('.hanging-rail__garment').addEventListener('click', (event) => {
          const button = event.currentTarget;
          if (button.hasAttribute('aria-pressed')) button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
          this.select(item);
        }, options);
        item.addEventListener('pointerenter', () => this.select(item), options);
        item.addEventListener('focusin', () => this.select(item), options);
      });
      this.resize = new ResizeObserver(() => this.update());
      this.resize.observe(this.track);
      this.update();
    }
    select(item) {
      this.items.forEach((entry) => entry.toggleAttribute('data-active', entry === item));
      this.querySelector('.hanging-rail__selected').textContent = item.dataset.title;
      const link = this.querySelector('[data-rail-product-link]');
      if (link) link.href = item.dataset.url;
    }
    update() {
      const bounds = this.track.getBoundingClientRect();
      const center = bounds.left + bounds.width / 2;
      const nearest = this.items.reduce((best, item) => {
        const distance = (element) => { const r = element.getBoundingClientRect(); return Math.abs(r.left + r.width / 2 - center); };
        return distance(item) < distance(best) ? item : best;
      }, this.items[0]);
      this.select(nearest);
      this.previous.disabled = this.track.scrollLeft <= 2;
      this.next.disabled = this.track.scrollLeft + this.track.clientWidth >= this.track.scrollWidth - 2;
    }
    disconnectedCallback() {
      this.controller?.abort();
      this.controller = null;
      this.resize?.disconnect();
      cancelAnimationFrame(this.frame);
    }
  });
}
