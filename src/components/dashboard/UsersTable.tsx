'use client'

import { useState, useTransition, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteUserAction, updateUserProfileAction, createUserAction } from '@/actions/users.actions'
import { signOut } from 'next-auth/react'
import type { AppUser, UserRole } from '@/types/user'
import { NOT_ALLOWED_AR } from './users/users-table.constants'
import { UsersTableToolbar } from './users/UsersTableToolbar'
import { UsersTableRows } from './users/UsersTableRows'
import { EditUserDialog } from './users/EditUserDialog'
import { AddUserDialog } from './users/AddUserDialog'
import { DeleteUserDialog } from './users/DeleteUserDialog'

interface UsersTableProps {
  users: AppUser[]
  isAdmin: boolean
  currentUserId: string
}

export function UsersTable({ users, isAdmin, currentUserId }: UsersTableProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const hasOtherAdmin = users.some((u) => u.role === 'admin' && u.id !== currentUserId)

  const [editUser, setEditUser] = useState<AppUser | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRole, setEditRole] = useState<UserRole>('viewer')
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null)

  const [deleteUser, setDeleteUser] = useState<AppUser | null>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('viewer')
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null)

  const editAvatarPreview = useMemo(
    () => (editAvatarFile ? URL.createObjectURL(editAvatarFile) : null),
    [editAvatarFile]
  )

  const newAvatarPreview = useMemo(
    () => (newAvatarFile ? URL.createObjectURL(newAvatarFile) : null),
    [newAvatarFile]
  )

  useEffect(() => {
    return () => {
      if (editAvatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(editAvatarPreview)
      }
    }
  }, [editAvatarPreview])

  useEffect(() => {
    return () => {
      if (newAvatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(newAvatarPreview)
      }
    }
  }, [newAvatarPreview])

  const lockSelfRole =
    !!editUser &&
    editUser.id === currentUserId &&
    !hasOtherAdmin &&
    editUser.role === 'admin'

  const editAvatarDisplaySrc = editAvatarPreview ?? editUser?.avatarUrl ?? null

  function guardOr(fn: () => void) {
    if (!isAdmin) {
      toast.error(NOT_ALLOWED_AR, { duration: 5000 })
      return
    }
    fn()
  }

  function openAdd() {
    guardOr(() => {
      setNewName('')
      setNewEmail('')
      setNewRole('viewer')
      setNewAvatarFile(null)
      setAddOpen(true)
    })
  }

  function submitAdd() {
    startTransition(async () => {
      const fd = new FormData()
      fd.append('name', newName.trim())
      fd.append('email', newEmail.trim())
      fd.append('role', newRole)
      if (newAvatarFile) {
        fd.append('avatar', newAvatarFile)
      }
      const res = await createUserAction(fd)
      if (res.success) {
        toast.success('تم إضافة المستخدم')
        setAddOpen(false)
        setNewAvatarFile(null)
        router.refresh()
      } else {
        toast.error(res.error ?? 'تعذّر إضافة المستخدم')
      }
    })
  }

  function openEdit(u: AppUser) {
    guardOr(() => {
      setEditUser(u)
      setEditName(u.name)
      setEditEmail(u.email)
      setEditRole(u.role)
      setEditAvatarFile(null)
    })
  }

  function openDelete(u: AppUser) {
    guardOr(() => setDeleteUser(u))
  }

  function submitEdit() {
    if (!editUser) return
    startTransition(async () => {
      const fd = new FormData()
      fd.append('userId', editUser.id)
      fd.append('name', editName.trim())
      fd.append('email', editEmail.trim())
      fd.append('role', editRole)
      if (editAvatarFile) {
        fd.append('avatar', editAvatarFile)
      }
      const res = await updateUserProfileAction(fd)
      if (res.success) {
        toast.success('تم تحديث بيانات المستخدم')
        setEditUser(null)
        setEditAvatarFile(null)
        router.refresh()
      } else {
        toast.error(res.error ?? 'تعذّر تحديث المستخدم')
      }
    })
  }

  function confirmDelete() {
    if (!deleteUser) return
    startTransition(async () => {
      const res = await deleteUserAction(deleteUser.id)
      if (res.success) {
        setDeleteUser(null)
        if (res.deletedSelf) {
          await signOut({ callbackUrl: '/' })
          return
        }
        toast.success('تم حذف المستخدم')
        router.refresh()
      } else {
        toast.error(res.error ?? 'تعذّر حذف المستخدم')
      }
    })
  }

  function closeEditDialog() {
    setEditUser(null)
    setEditAvatarFile(null)
  }

  return (
    <>
      {isAdmin ? <UsersTableToolbar onAddClick={openAdd} /> : null}

      <UsersTableRows
        users={users}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        hasOtherAdmin={hasOtherAdmin}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      <EditUserDialog
        open={!!editUser}
        onOpenChange={(open) => {
          if (!open) closeEditDialog()
        }}
        editUser={editUser}
        currentUserId={currentUserId}
        lockSelfRole={lockSelfRole}
        name={editName}
        setName={setEditName}
        email={editEmail}
        setEmail={setEditEmail}
        role={editRole}
        setRole={setEditRole}
        avatarDisplaySrc={editAvatarDisplaySrc}
        avatarIsBlobPreview={!!editAvatarPreview}
        onAvatarFile={setEditAvatarFile}
        pending={pending}
        onSave={submitEdit}
        onCancel={closeEditDialog}
      />

      <DeleteUserDialog
        user={deleteUser}
        currentUserId={currentUserId}
        pending={pending}
        onOpenChange={(open) => {
          if (!open) setDeleteUser(null)
        }}
        onConfirm={confirmDelete}
      />

      <AddUserDialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) {
            setNewName('')
            setNewEmail('')
            setNewRole('viewer')
            setNewAvatarFile(null)
          }
        }}
        name={newName}
        setName={setNewName}
        email={newEmail}
        setEmail={setNewEmail}
        role={newRole}
        setRole={setNewRole}
        avatarDisplaySrc={newAvatarPreview}
        avatarIsBlobPreview={!!newAvatarPreview}
        onAvatarFile={setNewAvatarFile}
        pending={pending}
        onSubmit={submitAdd}
      />
    </>
  )
}
