/**
 * Module Routes
 *
 * Routes = Views (one-to-one mapping)
 *
 * ✅ Register module routes
 * ✅ Render views
 * ❌ NO business logic
 * ❌ NO conditional routing based on business rules
 *
 * See: SPOFE Frontend Module Contract v1.0.0, Section 5.4
 */

import { ModuleView } from '../ui/ModuleView';
import { loadModuleData, handleUserAction } from '../ui/module.ui';
import { useModuleUI } from '../hooks/useModuleUI';

/**
 * Register module routes.
 *
 * This function registers:
 * ✅ One or more routes
 * ✅ Each route renders a view
 * ✅ Data flows from API → UI
 *
 * This function MUST NOT:
 * ❌ Implement business logic
 * ❌ Make routing decisions based on business rules
 * ❌ Transform/filter data
 *
 * @example
 * ```typescript
 * registerRoutes();
 * // Now routes are available to the router
 * ```
 */
export function registerRoutes() {
  // Example route registration
  // Adjust router API based on your framework

  // Route 1: Module main view
  registerRoute('/modules/<module-name>', moduleMainView);

  // You can add more routes here if needed
  // But keep them simple: route = view, one-to-one
}

/**
 * Main module view handler.
 *
 * This handler:
 * ✅ Loads data
 * ✅ Renders the view
 * ✅ Passes callbacks
 *
 * This handler MUST NOT:
 * ❌ Implement business logic
 * ❌ Make conditional decisions
 * ❌ Transform data
 */
async function moduleMainView() {
  const { loading, error, setLoading, setError } = useModuleUI();

  try {
    setLoading(true);
    const data = await loadModuleData();

    return ModuleView({
      data,
      isLoading: false,
      error: null,
      onAction: async () => {
        try {
          setLoading(true);
          await handleUserAction({});
          setLoading(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    });
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
    setLoading(false);

    return ModuleView({
      data: null,
      isLoading: false,
      error: error,
      onAction: undefined
    });
  }
}

/**
 * Helper: Register a route with the router.
 *
 * (This is a placeholder — adjust to your router implementation)
 */
function registerRoute(path: string, handler: () => Promise<any>) {
  // Example for Next.js or similar:
  // export const getServerSideProps = async () => { ... }

  // Example for React Router:
  // <Route path={path} element={handler()} />

  // Adjust based on your framework
  console.log(`Registering route: ${path}`);
}

/**
 * ⚠️ IMPORTANT: Routes = Views (1:1)
 *
 * This file:
 * ✅ Registers one route per view
 * ✅ Loads data and renders
 * ✅ Passes callbacks to the view
 * ✅ NO business logic
 *
 * Routing decisions:
 * ✅ URL-based only
 * ❌ NOT based on business rules
 * ❌ NOT based on data conditions
 * ❌ NOT based on user roles
 *
 * Business decisions happen in the backend.
 * The frontend just displays what the backend tells it.
 *
 * See: SPOFE Frontend Module Contract v1.0.0
 * - Section 5.4 (Routes Responsibilities)
 * - Section 3.P1 (Frontend is never authority)
 */
