// Path: apps/web/src/features/content/viewmodels/use-post-form.ts
// ViewModel: formulário de criação/edição de post. Orquestra validação leve
// (o backend revalida com Zod) e as mutations create/update.
'use client'

import { useState } from 'react'
import type { PostCategory, PostInput } from '../model/types'
import { useCreatePost } from './use-create-post'
import { useUpdatePost } from './use-update-post'

export interface PostFormValues {
  title: string
  slug: string
  excerpt: string
  body: string
  coverImage: string
  category: PostCategory
}

export const initialPostFormValues: PostFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  coverImage: '',
  category: 'news'
}

export function usePostForm(opts: { postId?: string; initial?: Partial<PostFormValues> } = {}) {
  const [values, setValues] = useState<PostFormValues>({
    ...initialPostFormValues,
    ...opts.initial
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const create = useCreatePost()
  const update = opts.postId ? useUpdatePost(opts.postId) : null
  const isPending = create.isPending || (update?.isPending ?? false)
  const error = create.error ?? update?.error

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (values.title.trim().length < 3) next.title = 'Título deve ter ao menos 3 caracteres'
    if (values.body.trim().length === 0) next.body = 'Conteúdo é obrigatório'
    if (values.slug.trim() !== '' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
      next.slug = 'Slug inválido (letras minúsculas, números e hífens)'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChange = (field: keyof PostFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const buildInput = (): PostInput => {
    const input: PostInput = {
      title: values.title,
      body: values.body,
      category: values.category,
      excerpt: values.excerpt.trim() === '' ? null : values.excerpt,
      coverImage: values.coverImage.trim() === '' ? null : values.coverImage
    }
    if (values.slug.trim() !== '') input.slug = values.slug
    return input
  }

  const handleSubmit = async (): Promise<boolean> => {
    if (!validate()) return false
    if (update) {
      await update.updatePostAsync(buildInput())
    } else {
      await create.createPostAsync(buildInput())
    }
    return true
  }

  return {
    values,
    errors,
    isPending,
    error,
    handleChange,
    handleSubmit,
    reset: () => {
      setValues({ ...initialPostFormValues, ...opts.initial })
      setErrors({})
      create.reset()
      update?.reset()
    }
  }
}
