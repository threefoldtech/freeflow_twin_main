import bootstrapNest from './main';
import mountNestApp from './utils/mount-nest';

mountNestApp({ mountPath: '/api/v2', bootstrapNest });
