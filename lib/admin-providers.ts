import { ProviderConfig, ProviderCredential } from "@/types/api"

export interface ProviderEnvironmentSummary {
  environment: string
  configCount: number
  enabledConfigCount: number
  activeCredentialCount: number
  totalCredentialCount: number
  isReady: boolean
  helperText: string
}

export interface ProviderSummary {
  providerName: string
  providerType: string
  environments: ProviderEnvironmentSummary[]
  configCount: number
  activeCredentialCount: number
  isReady: boolean
  needsAttention: boolean
  helperText: string
}

export function canRemoveCredential(
  credential: ProviderCredential,
  configs: ProviderConfig[],
  credentials: ProviderCredential[]
) {
  if (credential.status !== "active") return true

  const enabled = configs.some(
    (config) =>
      config.provider_name === credential.provider_name &&
      config.environment === credential.environment &&
      config.is_enabled
  )

  if (!enabled) return true

  const activeCount = credentials.filter(
    (item) =>
      item.provider_name === credential.provider_name &&
      item.environment === credential.environment &&
      item.status === "active"
  ).length

  return activeCount > 1
}

function makeHelperText(enabledConfigCount: number, activeCredentialCount: number) {
  if (enabledConfigCount === 0) {
    return "Mulai dari config agar provider bisa dipakai."
  }

  if (activeCredentialCount === 0) {
    return "Tambahkan credential aktif agar provider siap dipakai."
  }

  return "Provider ini siap dipakai."
}

export function buildProviderSummaries(
  configs: ProviderConfig[],
  credentials: ProviderCredential[]
) {
  const map = new Map<string, ProviderSummary>()

  for (const config of configs) {
    const current =
      map.get(config.provider_name) ??
      {
        providerName: config.provider_name,
        providerType: config.provider_type,
        environments: [],
        configCount: 0,
        activeCredentialCount: 0,
        isReady: false,
        needsAttention: false,
        helperText: "",
      }

    const envCredentials = credentials.filter(
      (credential) =>
        credential.provider_name === config.provider_name &&
        credential.environment === config.environment
    )
    const activeCredentialCount = envCredentials.filter(
      (credential) => credential.status === "active"
    ).length
    const enabledConfigCount = configs.filter(
      (item) =>
        item.provider_name === config.provider_name &&
        item.environment === config.environment &&
        item.is_enabled
    ).length

    const environmentSummary: ProviderEnvironmentSummary = {
      environment: config.environment,
      configCount: configs.filter(
        (item) =>
          item.provider_name === config.provider_name &&
          item.environment === config.environment
      ).length,
      enabledConfigCount,
      activeCredentialCount,
      totalCredentialCount: envCredentials.length,
      isReady: enabledConfigCount > 0 && activeCredentialCount > 0,
      helperText: makeHelperText(enabledConfigCount, activeCredentialCount),
    }

    current.environments = [
      ...current.environments.filter((item) => item.environment !== config.environment),
      environmentSummary,
    ].sort((a, b) => a.environment.localeCompare(b.environment))

    current.configCount = configs.filter(
      (item) => item.provider_name === config.provider_name
    ).length
    current.activeCredentialCount = credentials.filter(
      (item) =>
        item.provider_name === config.provider_name && item.status === "active"
    ).length
    current.isReady = current.environments.some((item) => item.isReady)
    current.needsAttention = !current.isReady
    current.helperText = current.isReady
      ? "Provider ini sudah punya config dan credential aktif."
      : current.environments[0]?.helperText ?? "Mulai dari config agar provider siap."

    map.set(config.provider_name, current)
  }

  for (const credential of credentials) {
    if (map.has(credential.provider_name)) continue

    const activeCredentialCount = credentials.filter(
      (item) =>
        item.provider_name === credential.provider_name && item.status === "active"
    ).length

    map.set(credential.provider_name, {
      providerName: credential.provider_name,
      providerType: "unknown",
      environments: [
        {
          environment: credential.environment,
          configCount: 0,
          enabledConfigCount: 0,
          activeCredentialCount:
            credential.status === "active" ? 1 : 0,
          totalCredentialCount: credentials.filter(
            (item) =>
              item.provider_name === credential.provider_name &&
              item.environment === credential.environment
          ).length,
          isReady: false,
          helperText: "Tambahkan config agar credential ini bisa dipakai.",
        },
      ],
      configCount: 0,
      activeCredentialCount,
      isReady: false,
      needsAttention: true,
      helperText: "Tambahkan config agar credential ini bisa dipakai.",
    })
  }

  return Array.from(map.values()).sort((a, b) =>
    a.providerName.localeCompare(b.providerName)
  )
}
