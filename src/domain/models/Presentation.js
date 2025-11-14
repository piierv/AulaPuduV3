/**
 * AULAPUDU 2.0 - PRESENTATION MODEL
 * Modelo de dominio para presentaciones
 */

export class Presentation {
  static CONTENT_TYPES = {
    PDF: 'pdf',
    SLIDES: 'slides',
    HTML: 'html',
    THREE_D: '3d'
  };

  constructor(data) {
    this.id = data.id || null;
    this.presenterId = data.presenter_id || data.presenterId;
    this.title = data.title;
    this.description = data.description || null;
    this.thumbnailUrl = data.thumbnail_url || data.thumbnailUrl || null;
    this.contentType = data.content_type || data.contentType || Presentation.CONTENT_TYPES.PDF;
    this.contentUrl = data.content_url || data.contentUrl || null;
    this.slides = data.slides || [];
    this.settings = data.settings || {};
    this.createdAt = data.created_at ? new Date(data.created_at) : new Date();
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : null;
    
    // Datos relacionados
    this.presenter = data.presenter || null;
  }

  /**
   * Crea una nueva presentación
   */
  static create(data) {
    return new Presentation({
      ...data,
      created_at: new Date().toISOString()
    });
  }

  /**
   * Obtiene el número de diapositivas
   */
  getSlideCount() {
    return this.slides.length;
  }

  /**
   * Verifica si tiene contenido
   */
  hasContent() {
    return this.contentUrl !== null || this.slides.length > 0;
  }

  /**
   * Verifica si es PDF
   */
  isPDF() {
    return this.contentType === Presentation.CONTENT_TYPES.PDF;
  }

  /**
   * Verifica si es HTML
   */
  isHTML() {
    return this.contentType === Presentation.CONTENT_TYPES.HTML;
  }

  /**
   * Verifica si es 3D
   */
  is3D() {
    return this.contentType === Presentation.CONTENT_TYPES.THREE_D;
  }

  /**
   * Agrega una diapositiva
   */
  addSlide(slide) {
    this.slides.push({
      id: slide.id || `slide-${this.slides.length + 1}`,
      order: this.slides.length,
      ...slide
    });
    this.updatedAt = new Date();
  }

  /**
   * Elimina una diapositiva
   */
  removeSlide(slideId) {
    this.slides = this.slides.filter(s => s.id !== slideId);
    // Reordenar
    this.slides.forEach((slide, index) => {
      slide.order = index;
    });
    this.updatedAt = new Date();
  }

  /**
   * Reordena diapositivas
   */
  reorderSlides(newOrder) {
    // newOrder es un array de IDs en el nuevo orden
    const slideMap = new Map(this.slides.map(s => [s.id, s]));
    this.slides = newOrder.map((id, index) => ({
      ...slideMap.get(id),
      order: index
    }));
    this.updatedAt = new Date();
  }

  /**
   * Actualiza configuración
   */
  updateSettings(settings) {
    this.settings = {
      ...this.settings,
      ...settings
    };
    this.updatedAt = new Date();
  }

  /**
   * Actualiza información básica
   */
  update(data) {
    if (data.title !== undefined) this.title = data.title;
    if (data.description !== undefined) this.description = data.description;
    if (data.thumbnailUrl !== undefined) this.thumbnailUrl = data.thumbnailUrl;
    if (data.contentUrl !== undefined) this.contentUrl = data.contentUrl;
    
    this.updatedAt = new Date();
  }

  /**
   * Convierte a objeto plano para la BD
   */
  toJSON() {
    return {
      id: this.id,
      presenter_id: this.presenterId,
      title: this.title,
      description: this.description,
      thumbnail_url: this.thumbnailUrl,
      content_type: this.contentType,
      content_url: this.contentUrl,
      slides: this.slides,
      settings: this.settings,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt?.toISOString() || null
    };
  }

  /**
   * Convierte a objeto para la UI
   */
  toDTO() {
    return {
      id: this.id,
      presenterId: this.presenterId,
      title: this.title,
      description: this.description,
      thumbnailUrl: this.thumbnailUrl,
      contentType: this.contentType,
      contentUrl: this.contentUrl,
      slideCount: this.getSlideCount(),
      hasContent: this.hasContent(),
      settings: this.settings,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt?.toISOString()
    };
  }
}

export default Presentation;