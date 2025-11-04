import Swal from 'sweetalert2'

export async function confirmMove(opts: {
  entityLabel: string // e.g., 'rol' | 'departamento' | 'cargo'
  userName: string
  fromName: string
  toName: string
}): Promise<boolean> {
  const { entityLabel, userName, fromName, toName } = opts
  const res = await Swal.fire({
    title: `¿Mover a ${userName}?`,
    html: `Vas a mover al usuario <b>${userName}</b> del ${entityLabel} <b>“${fromName}”</b> al ${entityLabel} <b>“${toName}”</b>.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Mover',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#1a4e8a',
    focusCancel: true,
  })
  return !!res.isConfirmed
}

export async function confirmUnassign(opts: {
  entityLabel: string // e.g., 'rol' | 'departamento' | 'cargo'
  userName: string
  fromName: string
}): Promise<boolean> {
  const { entityLabel, userName, fromName } = opts
  const res = await Swal.fire({
    title: `¿Quitar a ${userName}?`,
    html: `Se quitará al usuario <b>${userName}</b> del ${entityLabel} <b>“${fromName}”</b>.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Quitar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    focusCancel: true,
  })
  return !!res.isConfirmed
}

export async function confirmRemoveFromGroups(opts: {
  userName: string
  count: number
}): Promise<boolean> {
  const { userName, count } = opts
  const res = await Swal.fire({
    title: `¿Quitar a ${userName} de grupos?`,
    html: `Se quitará al usuario <b>${userName}</b> de <b>${count}</b> grupo(s) de aprobación.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Quitar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    focusCancel: true,
  })
  return !!res.isConfirmed
}
