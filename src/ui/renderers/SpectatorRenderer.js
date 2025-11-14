export default class SpectatorRenderer {
  render(session, presentation) {
    const slideUrl = presentation.slides[session.currentSlide];
    return `
      <div class="spectator-container">
        <div class="spectator-slide">
          <img src="${slideUrl}" alt="Diapositiva de la presentación" />
        </div>
        <div class="spectator-footer">
          <p>${session.title}</p>
        </div>
      </div>
    `;
  }
}