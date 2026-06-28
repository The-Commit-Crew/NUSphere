import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog'
import { renderWithMentions } from '../utils/mentionUtils'
import {
  getPostById,
  castVote,
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
} from '../services/Authservice'

function CommentBlock({
  comment,
  parentId = null,
  user,
  editingId,
  editContent,
  setEditContent,
  replyingTo,
  replyContent,
  setReplyContent,
  setEditingId,
  setReplyingTo,
  handleEdit,
  handleDelete,
  handleReply,
  setPendingDelete,
}) {
  const isAuthor = user && user.username === comment.author?.username
  const isEditing = editingId === comment.id
  const isReplying = replyingTo === comment.id

  return (
    <div
      style={{
        borderLeft: parentId ? '2px solid #E8E0D8' : 'none',
        marginLeft: parentId ? '24px' : '0',
        paddingLeft: parentId ? '16px' : '0',
      }}
      className="mt-4"
    >
      <div
        style={{
          backgroundColor: '#F5F0EB',
          border: '1px solid #E8E0D8',
        }}
        className="rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span style={{ color: '#9A8880' }} className="text-sm font-medium">
            u/{comment.author?.username}
          </span>
          {isAuthor && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(comment.id)
                  setEditContent(comment.content)
                }}
                style={{ color: '#9A8880' }}
                className="text-xs hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => setPendingDelete({ commentId: comment.id, parentId })}
                style={{ color: '#C4552A' }}
                className="text-xs hover:underline"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              style={{
                border: '1px solid #E8E0D8',
                backgroundColor: '#FFFFFF',
                color: '#1A1512',
              }}
              className="w-full rounded-lg p-3 text-sm resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(comment.id)}
                style={{ backgroundColor: '#C4552A', color: '#FFFFFF' }}
                className="px-3 py-1 rounded-full text-xs font-medium"
              >
                Save
              </button>
              <button
                onClick={() => { setEditingId(null); setEditContent('') }}
                style={{ color: '#9A8880' }}
                className="px-3 py-1 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p style={{ color: '#1A1512' }} className="text-sm">
           {renderWithMentions(comment.content)}
</p>
        )}

        {!parentId && !isEditing && (
          <button
            onClick={() => {
              setReplyingTo(isReplying ? null : comment.id)
              setReplyContent('')
            }}
            style={{ color: '#9A8880' }}
            className="text-xs mt-2 hover:underline"
          >
            {isReplying ? 'Cancel' : 'Reply'}
          </button>
        )}
      </div>

      {isReplying && (
        <div className="mt-2 ml-6 flex flex-col gap-2">
          <textarea
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            style={{
              border: '1px solid #E8E0D8',
              backgroundColor: '#FFFFFF',
              color: '#1A1512',
            }}
            className="w-full rounded-lg p-3 text-sm resize-none"
            rows={2}
          />
          <button
            onClick={() => handleReply(comment.id)}
            style={{ backgroundColor: '#C4552A', color: '#FFFFFF' }}
            className="self-start px-3 py-1 rounded-full text-xs font-medium"
          >
            Post Reply
          </button>
        </div>
      )}

      {comment.replies && comment.replies.map(reply => (
        <CommentBlock
          key={reply.id}
          comment={reply}
          parentId={comment.id}
          user={user}
          editingId={editingId}
          editContent={editContent}
          setEditContent={setEditContent}
          replyingTo={replyingTo}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          setEditingId={setEditingId}
          setReplyingTo={setReplyingTo}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleReply={handleReply}
          setPendingDelete={setPendingDelete}
        />
      ))}
    </div>
  )
}

function Postdetailpage() {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [upvoteCount, setUpvoteCount] = useState(0)
  const [downvoteCount, setDownvoteCount] = useState(0)
  const [userVoteStatus, setUserVoteStatus] = useState(null)
  const [voteMessage, setVoteMessage] = useState('')

  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [commentError, setCommentError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  const { id } = useParams()
  const { token, user } = useAuth()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError('')
      try {
        const [postData, commentsData] = await Promise.all([
          getPostById(id, token),
          getPostComments(id),
        ])
        setPost(postData)
        setUpvoteCount(postData.upvoteCount)
        setDownvoteCount(postData.downvoteCount)
        setUserVoteStatus(postData.userVoteStatus)
        setComments(commentsData)
      } catch (err) {
        setError('Failed to load post')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, token])

  async function handleVote(voteType) {
    if (!token) {
      setVoteMessage('Please log in to vote')
      return
    }
    try {
      const result = await castVote(id, voteType, token)
      setUpvoteCount(result.upvoteCount)
      setDownvoteCount(result.downvoteCount)
      setUserVoteStatus(prev => prev === voteType ? null : voteType)
      setVoteMessage('')
    } catch (err) {
      setVoteMessage('Failed to cast vote')
      console.error(err)
    }
  }

  async function handleCreateComment() {
    if (!token) {
      setCommentError('Please log in to comment')
      return
    }
    if (!newComment.trim()) return
    try {
      const created = await createComment(id, { content: newComment }, token)
      created.replies = []
      created.author = { username: user.username }
      setComments(prev => [...prev, created])
      setNewComment('')
      setCommentError('')
    } catch (err) {
      setCommentError(err.message)
    }
  }

  async function handleReply(parentId) {
    if (!token) {
      setCommentError('Please log in to comment')
      return
    }
    if (!replyContent.trim()) return
    try {
      const created = await createComment(id, { content: replyContent, parentId }, token)
      created.replies = []
      created.author = { username: user.username }
      setComments(prev => prev.map(comment =>
        comment.id === parentId
          ? { ...comment, replies: [...comment.replies, created] }
          : comment
      ))
      setReplyingTo(null)
      setReplyContent('')
      setCommentError('')
    } catch (err) {
      setCommentError(err.message)
    }
  }

  async function handleEdit(commentId) {
    if (!editContent.trim()) return
    try {
      await updateComment(commentId, { content: editContent }, token)
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, content: editContent }
        }
        return {
          ...comment,
          replies: comment.replies.map(reply =>
            reply.id === commentId ? { ...reply, content: editContent } : reply
          )
        }
      }))
      setEditingId(null)
      setEditContent('')
    } catch (err) {
      setCommentError(err.message)
    }
  }

  async function handleDelete(commentId, parentId = null) {
    try {
      await deleteComment(commentId, token)
      if (parentId) {
        setComments(prev => prev.map(comment =>
          comment.id === parentId
            ? { ...comment, replies: comment.replies.filter(r => r.id !== commentId) }
            : comment
        ))
      } else {
        setComments(prev => prev.filter(comment => comment.id !== commentId))
      }
    } catch (err) {
      setCommentError(err.message)
    } finally {
      setPendingDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#9A8880' }}>Loading post...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#C4552A' }}>{error}</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#9A8880' }}>Post not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">

      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8E0D8',
        }}
        className="rounded-lg p-6 mb-6"
      >
        <h1 style={{ color: '#1A1512' }} className="text-2xl font-bold mb-4">
          {post.title}
        </h1>

        <p style={{ color: '#1A1512' }} className="mb-6 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>

        <div className="flex items-center gap-3 flex-wrap mb-6">
          <span
            style={{ backgroundColor: '#F5F0EB', color: '#9A8880' }}
            className="px-3 py-1 rounded-full text-sm font-medium"
          >
            {post.topic?.name}
          </span>
          <span style={{ color: '#9A8880' }} className="text-sm">
            u/{post.author?.username}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => handleVote('UP')}
            style={{
              color: userVoteStatus === 'UP' ? '#C4552A' : '#9A8880',
              border: `1px solid ${userVoteStatus === 'UP' ? '#C4552A' : '#E8E0D8'}`,
              backgroundColor: userVoteStatus === 'UP' ? '#FDF6F3' : 'transparent',
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors"
          >
            ▲ {upvoteCount}
          </button>

          <button
            onClick={() => handleVote('DOWN')}
            style={{
              color: userVoteStatus === 'DOWN' ? '#C4552A' : '#9A8880',
              border: `1px solid ${userVoteStatus === 'DOWN' ? '#C4552A' : '#E8E0D8'}`,
              backgroundColor: userVoteStatus === 'DOWN' ? '#FDF6F3' : 'transparent',
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors"
          >
            ▼ {downvoteCount}
          </button>

          {voteMessage && (
            <span style={{ color: '#C4552A' }} className="text-sm">
              {voteMessage}
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8E0D8',
        }}
        className="rounded-lg p-6"
      >
        <h2 style={{ color: '#1A1512' }} className="text-lg font-semibold mb-4">
          Comments ({comments.length})
        </h2>

        {commentError && (
          <p style={{ color: '#C4552A' }} className="text-sm mb-4">
            {commentError}
          </p>
        )}

        {comments.length === 0 && (
          <p style={{ color: '#9A8880' }} className="text-sm mb-6">
            No comments yet. Be the first to comment!
          </p>
        )}

        {comments.map(comment => (
          <CommentBlock
            key={comment.id}
            comment={comment}
            user={user}
            editingId={editingId}
            editContent={editContent}
            setEditContent={setEditContent}
            replyingTo={replyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            setEditingId={setEditingId}
            setReplyingTo={setReplyingTo}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleReply={handleReply}
            setPendingDelete={setPendingDelete}
          />
        ))}

        <DeleteConfirmDialog
          open={pendingDelete !== null}
          message="Delete this comment? This can't be undone."
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => handleDelete(pendingDelete.commentId, pendingDelete.parentId)}
        />

        <div className="mt-6 flex flex-col gap-3">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder={token ? 'Write a comment...' : 'Please log in to comment'}
            disabled={!token}
            style={{
              border: '1px solid #E8E0D8',
              backgroundColor: token ? '#FFFFFF' : '#F5F0EB',
              color: '#1A1512',
            }}
            className="w-full rounded-lg p-3 text-sm resize-none"
            rows={3}
          />
          <button
            onClick={handleCreateComment}
            disabled={!token}
            style={{
              backgroundColor: token ? '#C4552A' : '#E8E0D8',
              color: token ? '#FFFFFF' : '#9A8880',
            }}
            className="self-start px-4 py-2 rounded-full text-sm font-medium"
          >
            Post Comment
          </button>
        </div>
      </div>

    </div>
  )
}

export default Postdetailpage
