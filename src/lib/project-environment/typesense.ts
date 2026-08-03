import { log } from "./command";

export interface TypesenseConnection {
  url: string;
  apiKey: string;
}

interface TypesenseRequestOptions {
  request?: (input: string, init?: RequestInit) => Promise<Response>;
}

interface DeleteTypesenseCollectionsOptions extends TypesenseRequestOptions {
  allowFailure?: boolean;
}

function endpoint(connection: TypesenseConnection, path: string): string {
  return `${connection.url.replace(/\/$/, "")}${path}`;
}

function headers(connection: TypesenseConnection): Record<string, string> {
  return { "X-TYPESENSE-API-KEY": connection.apiKey };
}

export async function verifyTypesense(
  connection: TypesenseConnection,
  options: TypesenseRequestOptions = {},
): Promise<void> {
  const response = await (options.request ?? fetch)(endpoint(connection, "/health"), {
    headers: headers(connection),
  });
  if (!response.ok) throw new Error(`Typesense health failed with HTTP ${response.status}`);
}

export async function deleteTypesenseCollections(
  connection: TypesenseConnection,
  prefix: string,
  options: DeleteTypesenseCollectionsOptions = {},
): Promise<string[]> {
  if (!prefix) throw new Error("Typesense collection prefix is required");

  const request = options.request ?? fetch;
  const listResponse = await request(endpoint(connection, "/collections"), {
    headers: headers(connection),
  });
  if (!listResponse.ok) {
    const message = `Typesense collection listing failed with HTTP ${listResponse.status}`;
    if (!options.allowFailure) throw new Error(message);
    log("clean", `${message}; skipping`);
    return [];
  }

  const collections = (await listResponse.json()) as Array<{ name: string }>;
  const matchingNames = collections
    .map(({ name }) => name)
    .filter((name) => name.startsWith(prefix));
  const deletedNames = await Promise.all(
    matchingNames.map(async (name) => {
      const response = await request(
        endpoint(connection, `/collections/${encodeURIComponent(name)}`),
        { method: "DELETE", headers: headers(connection) },
      );
      if (!response.ok && !options.allowFailure) {
        throw new Error(`Could not delete Typesense collection ${name}: HTTP ${response.status}`);
      }
      log("clean", `deleted Typesense collection ${name}: HTTP ${response.status}`);
      return response.ok ? name : undefined;
    }),
  );

  return deletedNames.filter((name): name is string => name !== undefined);
}
