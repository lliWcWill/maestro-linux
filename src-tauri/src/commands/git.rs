use std::path::PathBuf;

use crate::git::{BranchInfo, CommitInfo, Git, GitError, WorktreeInfo};

#[tauri::command]
pub async fn git_branches(repo_path: String) -> Result<Vec<BranchInfo>, GitError> {
    let git = Git::new(&repo_path);
    git.list_branches().await
}

#[tauri::command]
pub async fn git_current_branch(repo_path: String) -> Result<String, GitError> {
    let git = Git::new(&repo_path);
    git.current_branch().await
}

#[tauri::command]
pub async fn git_uncommitted_count(repo_path: String) -> Result<usize, GitError> {
    let git = Git::new(&repo_path);
    git.uncommitted_count().await
}

#[tauri::command]
pub async fn git_worktree_list(repo_path: String) -> Result<Vec<WorktreeInfo>, GitError> {
    let git = Git::new(&repo_path);
    git.worktree_list().await
}

#[tauri::command]
pub async fn git_worktree_add(
    repo_path: String,
    path: String,
    new_branch: Option<String>,
    base_ref: Option<String>,
) -> Result<WorktreeInfo, GitError> {
    let git = Git::new(&repo_path);
    let wt_path = PathBuf::from(&path);
    git.worktree_add(
        &wt_path,
        new_branch.as_deref(),
        base_ref.as_deref(),
    )
    .await
}

#[tauri::command]
pub async fn git_worktree_remove(
    repo_path: String,
    path: String,
    force: bool,
) -> Result<(), GitError> {
    let git = Git::new(&repo_path);
    let wt_path = PathBuf::from(&path);
    git.worktree_remove(&wt_path, force).await
}

#[tauri::command]
pub async fn git_commit_log(
    repo_path: String,
    max_count: usize,
    all_branches: bool,
) -> Result<Vec<CommitInfo>, GitError> {
    let git = Git::new(&repo_path);
    git.commit_log(max_count, all_branches).await
}
