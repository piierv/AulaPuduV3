/**
 * AULAPUDU 2.0 - REALTIME SERVICE
 * Servicio para la comunicación en tiempo real con Supabase
 */

export class RealtimeService {
  constructor(supabaseClient, eventBus, logger) {
    this.supabase = supabaseClient;
    this.eventBus = eventBus;
    this.logger = logger.createChild({ context: 'RealtimeService' });
    this.channel = null;
    this.sessionId = null;
  }

  /**
   * Se une a un canal de sesión para comunicación en tiempo real
   */
  joinChannel(sessionId) {
    if (this.channel) {
      this.leaveChannel();
    }

    this.sessionId = sessionId;
    this.channel = this.supabase.channel(`session:${sessionId}`);

    this.channel
      .on('broadcast', { event: '*' }, ({ payload }) => {
        this.logger.debug('Received broadcast event', payload);
        this.eventBus.emit(payload.event, payload.data, true); // El tercer parámetro indica que es un evento remoto
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.logger.info('Successfully subscribed to channel', { sessionId });
        }
      });

    this.setupLocalEventListeners();
  }

  /**
   * Abandona el canal de sesión
   */
  leaveChannel() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
      this.sessionId = null;
      this.logger.info('Left channel');
    }
  }

  /**
   * Configura los listeners para los eventos locales que deben ser broadcast
   */
  setupLocalEventListeners() {
    const eventsToBroadcast = [
      'session:slideChanged',
      'session:paused',
      'session:resumed',
      'session:ended',
      'attendee:kicked'
    ];

    eventsToBroadcast.forEach(event => {
      this.eventBus.on(event, (data, isRemote) => {
        if (!isRemote) { // Evitar bucles de eventos
          this.broadcast(event, data);
        }
      });
    });
  }

  /**
   * Envía un evento a todos los clientes del canal
   */
  broadcast(event, data) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: event,
        payload: {
          event,
          data
        }
      });
      this.logger.debug('Broadcasted event', { event, data });
    }
  }
}

export default RealtimeService;
