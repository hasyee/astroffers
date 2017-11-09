import Store, { thunk } from 'repatch';

export default new Store<{}>({}).addMiddleware(thunk.withExtraArgument({}));
