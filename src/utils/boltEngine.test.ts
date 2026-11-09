import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectOptimalMode,
  matchWakeWord,
  togglePinSession,
  removeSession,
  getDefaultSettings,
  getBuildWorkflowFiles,
  ChatSession
} from './boltEngine';

test('detectOptimalMode correctly identifies education, coding, build, device, pro, and fast intents', () => {
  assert.equal(detectOptimalMode('Solve this complex math equation with step by step guide'), 'education');
  assert.equal(detectOptimalMode('কঠিন গণিত ও সায়েন্স প্রবলেম সলভ করে দাও'), 'education');
  assert.equal(detectOptimalMode('Write python code to generate a QR code'), 'coding');
  assert.equal(detectOptimalMode('Build an interactive 3D solar system mini game'), 'build');
  assert.equal(detectOptimalMode('আমার ল্যাপটপে নতুন ড্রাইভ খুলতে পারতেছিনা সাহায্য করো'), 'device');
  assert.equal(detectOptimalMode('Laptop mouse and keyboard simulated command troubleshoot'), 'device');
  assert.equal(detectOptimalMode('Create a financial spreadsheet report and business plan'), 'pro');
  assert.equal(detectOptimalMode('Hello what is the capital of Bangladesh?'), 'fast');
});

test('matchWakeWord triggers on wake word and handles off/stop', () => {
  const wake1 = matchWakeWord('Bolt tell me the weather');
  assert.equal(wake1.isWake, true);
  assert.equal(wake1.isStop, false);

  const stop1 = matchWakeWord('Bolt off');
  assert.equal(stop1.isStop, true);

  const stop2 = matchWakeWord('bolt stop please');
  assert.equal(stop2.isStop, true);

  const none = matchWakeWord('Random conversation');
  assert.equal(none.isWake, false);
  assert.equal(none.isStop, false);
});

test('togglePinSession flips pinned status properly', () => {
  const sessions: ChatSession[] = [
    { id: '1', title: 'Chat 1', pinned: false, createdAt: 100, updatedAt: 100, messages: [] },
    { id: '2', title: 'Chat 2', pinned: true, createdAt: 200, updatedAt: 200, messages: [] }
  ];

  const updated = togglePinSession(sessions, '1');
  assert.equal(updated.find(s => s.id === '1')?.pinned, true);
  assert.equal(updated.find(s => s.id === '2')?.pinned, true);

  const unpinned = togglePinSession(updated, '2');
  assert.equal(unpinned.find(s => s.id === '2')?.pinned, false);
});

test('removeSession correctly deletes targeted session', () => {
  const sessions: ChatSession[] = [
    { id: '1', title: 'Chat 1', pinned: false, createdAt: 100, updatedAt: 100, messages: [] },
    { id: '2', title: 'Chat 2', pinned: true, createdAt: 200, updatedAt: 200, messages: [] }
  ];

  const result = removeSession(sessions, '1');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, '2');
});

test('getDefaultSettings contains 6 AI provider slots matching user mindmap and screenshots', () => {
  const settings = getDefaultSettings();
  assert.equal(settings.aiSlots.length, 6);
  assert.equal(settings.aiSlots[0].name, 'Education');
  assert.equal(settings.aiSlots[1].name, 'Coding');
  assert.equal(settings.aiSlots[2].name, 'Build');
  assert.equal(settings.aiSlots[3].name, 'Device control');
  assert.equal(settings.aiSlots[4].name, 'Deep work');
  assert.equal(settings.aiSlots[5].name, 'Voice');
});

test('getBuildWorkflowFiles generates complete GitHub Actions workflows for APK and EXE', () => {
  const files = getBuildWorkflowFiles();
  assert.ok(files.apkWorkflow.includes('name: Build Android APK'));
  assert.ok(files.apkWorkflow.includes('assembleDebug'));
  assert.ok(files.exeWorkflow.includes('name: Build Windows EXE'));
  assert.ok(files.exeWorkflow.includes('electron-builder'));
  assert.ok(files.capacitorConfig.includes('com.bolt.app'));
});
