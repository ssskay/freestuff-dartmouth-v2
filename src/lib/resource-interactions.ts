/**
 * Client-side resource interactions: upvoting and issue reporting.
 *
 * This module is the single source for the behavior that was previously
 * copy-pasted into every page's inline <script>. Import it once per page:
 *
 *   import { initResourceInteractions } from '../lib/resource-interactions';
 *   initResourceInteractions();
 *
 * Resource identity is the stable slug carried on `data-resource-id`
 * (see catalog.ts). Upvote/report calls pass that slug straight through.
 */

import { getFingerprint } from './fingerprint';
import { upvoteResource, removeUpvote, getUserVotes, reportIssue } from './supabase';
import type { IssueType } from '../site.config';

export function initResourceInteractions(): void {
  const fingerprint = getFingerprint();

  // Reflect the user's existing votes in the UI.
  getUserVotes(fingerprint)
    .then((votedIds) => {
      votedIds.forEach((id) => {
        const btn = document.querySelector(
          `button.upvote-btn[data-resource-id="${CSS.escape(id)}"]`
        ) as HTMLButtonElement | null;
        if (btn) btn.dataset.voted = 'true';
      });
    })
    .catch((error) => console.error('Error loading vote state:', error));

  // Upvote / remove-upvote.
  document.addEventListener('click', async (e) => {
    const button = (e.target as HTMLElement).closest('.upvote-btn') as HTMLButtonElement | null;
    if (!button) return;

    e.preventDefault();
    const resourceId = button.dataset.resourceId;
    if (!resourceId) return;

    const hasVoted = button.dataset.voted === 'true';
    button.disabled = true;

    try {
      const result = hasVoted
        ? await removeUpvote(resourceId, fingerprint)
        : await upvoteResource(resourceId, fingerprint);

      if (result.success) {
        button.dataset.voted = hasVoted ? 'false' : 'true';
        const countSpan = button.querySelector('.upvote-count') as HTMLSpanElement | null;
        if (countSpan) countSpan.textContent = result.upvotes.toString();
      } else {
        console.warn('Vote action failed:', result.message);
      }
    } catch (error) {
      console.error('Error toggling vote:', error);
    } finally {
      button.disabled = false;
    }
  });

  // Report dropdown: toggle open/closed.
  let currentOpenDropdown: HTMLElement | null = null;

  document.addEventListener('click', (e) => {
    const reportBtn = (e.target as HTMLElement).closest('.report-btn') as HTMLButtonElement | null;
    if (!reportBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const resourceId = reportBtn.dataset.resourceId;
    if (!resourceId) return;

    const dropdown = document.querySelector(
      `.report-dropdown[data-resource-id="${CSS.escape(resourceId)}"]`
    ) as HTMLElement | null;
    if (!dropdown) return;

    if (currentOpenDropdown && currentOpenDropdown !== dropdown) {
      currentOpenDropdown.style.display = 'none';
    }
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
    currentOpenDropdown = isVisible ? null : dropdown;
  });

  // Close the dropdown when clicking outside of it.
  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.report-wrapper') && currentOpenDropdown) {
      currentOpenDropdown.style.display = 'none';
      currentOpenDropdown = null;
    }
  });

  // Submit a report. Email (for the sticker offer) is collected *before* the
  // single insert, so opting in no longer creates a duplicate report row.
  document.addEventListener('click', async (e) => {
    const reportOption = (e.target as HTMLElement).closest('.report-option') as HTMLButtonElement | null;
    if (!reportOption) return;

    e.preventDefault();
    e.stopPropagation();

    const issueType = reportOption.dataset.issue as IssueType | undefined;
    const dropdown = reportOption.closest('.report-dropdown') as HTMLElement | null;
    const resourceId = dropdown?.dataset.resourceId;
    if (!resourceId || !issueType || !dropdown) return;

    const allOptions = dropdown.querySelectorAll('.report-option') as NodeListOf<HTMLButtonElement>;
    allOptions.forEach((opt) => (opt.disabled = true));

    // Ask about the sticker first so the report is submitted exactly once.
    let email: string | undefined;
    const wantsSticker = confirm(
      'Thanks for catching that! 🎉\n\n' +
        'Want a free sticker? Click OK to enter your email, or Cancel if you\'re good.'
    );
    if (wantsSticker) {
      const entered = prompt('Drop your email here and we\'ll send you a sticker:');
      if (entered && entered.trim()) email = entered.trim();
    }

    try {
      const result = await reportIssue(resourceId, issueType, undefined, email);

      dropdown.style.display = 'none';
      currentOpenDropdown = null;

      if (result.success) {
        alert(
          email
            ? 'Thanks! We\'ll send your sticker soon. 🌲'
            : 'Report submitted! Thanks for helping keep this accurate. 🌲'
        );
      } else {
        alert('Oops, something went wrong. Please try again.');
        console.error('Report submission error:', result.error);
      }
    } catch (error) {
      alert('Oops, something went wrong. Please try again.');
      console.error('Error submitting report:', error);
    } finally {
      allOptions.forEach((opt) => (opt.disabled = false));
    }
  });
}
