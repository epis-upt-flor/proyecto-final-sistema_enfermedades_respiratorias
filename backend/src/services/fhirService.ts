import axios, { AxiosInstance } from 'axios';

export interface FhirResource {
  resourceType: string;
  id?: string;
  [key: string]: unknown;
}

export interface FhirBundle {
  resourceType: 'Bundle';
  type: string;
  entry: Array<{ resource: FhirResource }>;
}

export interface FhirServiceOptions {
  baseUrl?: string;
  authToken?: string;
  tenantId?: string;
}

/**
 * Servicio responsable de interactuar con servidores compatibles con HL7 FHIR.
 * Todas las llamadas se realizan mediante HTTP REST y soportan autenticación por token.
 */
export class FhirService {
  private readonly client: AxiosInstance;
  private readonly tenantId?: string;

  constructor(options: FhirServiceOptions = {}) {
    const baseURL =
      options.baseUrl ??
      process.env.FHIR_BASE_URL ??
      'https://fhir.example.com/fhir';

    const authToken = options.authToken ?? process.env.FHIR_AUTH_TOKEN;

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/fhir+json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      timeout: 10000,
    });

    this.tenantId = options.tenantId ?? process.env.FHIR_TENANT_ID;
  }

  /**
   * Crea un recurso FHIR.
   */
  async createResource<T extends FhirResource>(resource: T): Promise<T> {
    const response = await this.client.post<T>('/', this.decorateResource(resource));
    return response.data;
  }

  /**
   * Obtiene un recurso FHIR por tipo e ID.
   */
  async getResource<T extends FhirResource>(resourceType: string, id: string): Promise<T> {
    const response = await this.client.get<T>(`/${resourceType}/${id}`);
    return response.data;
  }

  /**
   * Realiza una búsqueda utilizando parámetros FHIR estándar.
   */
  async search<T = FhirBundle>(resourceType: string, params: Record<string, string | number>): Promise<T> {
    const response = await this.client.get<T>(`/${resourceType}`, { params });
    return response.data;
  }

  /**
   * Realiza una actualización parcial (PATCH) sobre un recurso FHIR existente.
   */
  async patchResource<T extends FhirResource>(
    resourceType: string,
    id: string,
    patchOperations: Array<Record<string, unknown>>,
  ): Promise<T> {
    const response = await this.client.patch<T>(`/${resourceType}/${id}`, patchOperations, {
      headers: { 'Content-Type': 'application/json-patch+json' },
    });
    return response.data;
  }

  /**
   * Sincroniza un lote de recursos utilizando un Bundle tipo "transaction".
   */
  async syncBundle(bundle: FhirBundle): Promise<FhirBundle> {
    const enrichedBundle = this.decorateBundle(bundle);
    const response = await this.client.post<FhirBundle>('/', enrichedBundle);
    return response.data;
  }

  private decorateResource<T extends FhirResource>(resource: T): T {
    if (!this.tenantId) {
      return resource;
    }

    const existingTags = Array.isArray((resource.meta as { tag?: unknown[] })?.tag)
      ? ((resource.meta as { tag?: unknown[] })!.tag as unknown[])
      : [];

    return {
      ...resource,
      meta: {
        ...(resource.meta as Record<string, unknown> | undefined),
        tag: [
          ...existingTags,
          { system: 'https://respicare.health/tenants', code: this.tenantId },
        ],
      },
    };
  }

  private decorateBundle(bundle: FhirBundle): FhirBundle {
    return {
      ...bundle,
      entry: bundle.entry.map((entry) => ({
        ...entry,
        resource: this.decorateResource(entry.resource),
      })),
    };
  }
}

export const fhirService = new FhirService();

