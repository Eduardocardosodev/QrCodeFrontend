import { Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../auth/useAuth.ts'
import { FolderFilter } from '../components/dashboard/FolderFilter.tsx'
import { FolderFormModal } from '../components/dashboard/FolderFormModal.tsx'
import { Pagination } from '../components/dashboard/Pagination.tsx'
import { QrCodeCard } from '../components/dashboard/QrCodeCard.tsx'
import { QrCodeFormModal } from '../components/dashboard/QrCodeFormModal.tsx'
import { Button } from '../components/ui/Button.tsx'
import { useAnalytics } from '../hooks/useAnalytics.ts'
import { useQrCodes } from '../hooks/useQrCodes.ts'
import { ApiClientError } from '../services/apiClient.ts'
import { DEFAULT_QR_COLOR } from '../types/qrCode.ts'

export function DashboardPage() {
  const { user, logout } = useAuth()
  const {
    filteredQrCodes,
    folders,
    availableFolders,
    selectedFolder,
    setSelectedFolder,
    isLoading,
    isFoldersLoading,
    error,
    foldersError,
    reload: reloadQrCodes,
    createQrCode,
    createQrCodesBatch,
    createFolder,
    page,
    pagination,
    goToPage,
  } = useQrCodes()

  const {
    getScanCount,
    reloadSummary,
    reload: reloadAnalytics,
  } = useAnalytics()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)

  async function handleRefresh() {
    await Promise.all([reloadQrCodes(), reloadAnalytics()])
  }

  async function handleCreate(values: {
    name: string
    destinationUrl: string
    folder: string
    color: string
  }) {
    try {
      await createQrCode({
        name: values.name,
        destinationUrl: values.destinationUrl,
        folder: values.folder,
        color: values.color || DEFAULT_QR_COLOR,
      })
      await reloadSummary()
    } catch (err) {
      throw err instanceof ApiClientError
        ? err
        : new Error('Não foi possível criar o QR Code.')
    }
  }

  async function handleCreateBatch(values: {
    prefix: string
    quantity: number
    destinationUrl: string
    folderId: string
    color: string
  }) {
    try {
      await createQrCodesBatch({
        prefix: values.prefix,
        quantity: values.quantity,
        destinationUrl: values.destinationUrl,
        folderId: values.folderId,
        color: values.color || DEFAULT_QR_COLOR,
      })
      await reloadSummary()
    } catch (err) {
      throw err instanceof ApiClientError
        ? err
        : new Error('Não foi possível criar os QR Codes em lote.')
    }
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <h1 className="dashboard-page__title">QR Codes</h1>
          <p className="dashboard-page__subtitle">
            Olá, {user?.email}. Gerencie seus links dinâmicos em um só lugar.
          </p>
        </div>

        <div className="dashboard-page__actions">
          <Button type="button" variant="secondary" onClick={() => void handleRefresh()}>
            <RefreshCw size={16} aria-hidden="true" />
            Atualizar
          </Button>
          <Button type="button" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} aria-hidden="true" />
            Novo QR Code
          </Button>
          <Button type="button" variant="secondary" onClick={() => setIsFolderModalOpen(true)}>
            Nova pasta
          </Button>
          <Button type="button" variant="secondary" onClick={() => logout()}>
            Sair
          </Button>
        </div>
      </header>

      {!isLoading && !error ? (
        <FolderFilter
          folders={folders}
          selectedFolder={selectedFolder}
          onChange={setSelectedFolder}
        />
      ) : null}

      {isLoading ? (
        <div className="dashboard-state">Carregando QR Codes...</div>
      ) : error ? (
        <div className="dashboard-state dashboard-state--error" role="alert">
          <p>{error}</p>
          <Button type="button" onClick={() => void reloadQrCodes()}>Tentar novamente</Button>
        </div>
      ) : filteredQrCodes.length === 0 ? (
        <div className="dashboard-state">
          <p>
            Você ainda não criou nenhum QR Code.
          </p>
          <Button type="button" onClick={() => setIsCreateModalOpen(true)}>
            Criar primeiro QR Code
          </Button>
        </div>
      ) : (
        <section className="qr-grid" aria-label="Lista de QR Codes">
          {filteredQrCodes.map((qrCode) => (
            <QrCodeCard
              key={qrCode.id}
              qrCode={qrCode}
              scanCount={getScanCount(qrCode.id)}
            />
          ))}
        </section>
      )}

      <Pagination
        page={page}
        totalPages={pagination.totalPages}
        isLoading={isLoading}
        onPageChange={goToPage}
        ariaLabel="Paginação de QR Codes"
        totalItems={pagination.total}
      />

      <QrCodeFormModal
        mode="create"
        isOpen={isCreateModalOpen}
        folders={availableFolders}
        foldersLoading={isFoldersLoading}
        foldersError={foldersError}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        onSubmitBatch={handleCreateBatch}
      />
      <FolderFormModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSubmit={async (name) => {
          await createFolder({ name })
        }}
      />
    </div>
  )
}
