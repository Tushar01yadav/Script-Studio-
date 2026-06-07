import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  ClipboardDocumentIcon,
  CircleStackIcon,
  SparklesIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

const normalizeScenes = (scenesList) => {
  if (!Array.isArray(scenesList)) return [];
  return scenesList.map((scene, idx) => {
    return {
      scene_number: scene.scene_number ?? scene.sceneNumber ?? (idx + 1),
      duration: scene.duration ?? scene.sceneDurationEstimate ?? scene.duration_estimate ?? '',
      narration: scene.narration ?? scene.narrationText ?? scene.narration_text ?? '',
      visual: scene.visual ?? scene.visualDescription ?? scene.visual_description ?? '',
      image_prompt: scene.image_prompt ?? scene.aiImagePrompt ?? scene.imagePrompt ?? scene.ai_image_prompt ?? '',
      generated_image_url: scene.generated_image_url ?? scene.generatedImageUrl ?? ''
    };
  });
};

const SceneGenerator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project');

  const [project, setProject] = useState(null);
  const [script, setScript] = useState('');
  const [scenes, setScenes] = useState([]);
  
  const [loadingProject, setLoadingProject] = useState(false);
  const [generatingScenes, setGeneratingScenes] = useState(false);

  // Load project details
  useEffect(() => {
    if (!projectId) return;

    // Immediately reset states to prevent leakage of prior project data
    setProject(null);
    setScript('');
    setScenes([]);

    setLoadingProject(true);
    api.get(`/projects/${projectId}`)
      .then(res => {
        setProject(res.data);
        setScript(res.data.paraphrased_script || '');
        if (res.data.scene_plan) {
          try {
            const parsed = JSON.parse(res.data.scene_plan);
            setScenes(normalizeScenes(parsed));
          } catch (e) {
            setScenes([]);
          }
        }
      })
      .catch(err => {
        toast.error('Failed to load project');
      })
      .finally(() => {
        setLoadingProject(false);
      });
  }, [projectId]);

  const handleSaveScenes = async (scenesList = scenes, showToast = true) => {
    if (!projectId) return toast.error('No active project');
    try {
      const payload = {
        scene_plan: JSON.stringify(scenesList)
      };
      await api.put(`/projects/${projectId}`, payload);
      if (showToast) toast.success('Scene plan saved successfully!');
    } catch (err) {
      toast.error('Failed to save scene plan');
    }
  };

  const handleGenerateScenes = async () => {
    if (!script.trim()) {
      return toast.error('Script input cannot be empty. Please go back to the Transcript section first.');
    }
    setGeneratingScenes(true);
    try {
      const res = await api.post('/scenes/generate', { script });
      const parsedScenesStr = res.data.scene_plan;
      let parsedList = [];
      try {
        parsedList = JSON.parse(parsedScenesStr);
      } catch (jsonErr) {
        // Fallback or display as text
        toast.error("Format mismatch in Mistral response. Try again.");
        return;
      }
      const normalized = normalizeScenes(parsedList);
      setScenes(normalized);
      toast.success('Scene storyboard generated!');
      handleSaveScenes(normalized, false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate scenes');
    } finally {
      setGeneratingScenes(false);
    }
  };

  const updateSceneDetail = (index, key, value) => {
    const updated = [...scenes];
    updated[index][key] = value;
    setScenes(updated);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied text!');
  };



  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-[#0d1222]/30 py-24 text-center border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-2">No active project selected</h3>
        <p className="text-gray-400 max-w-sm mb-6">Choose or create a project on the Dashboard to design a scene storyboard.</p>
        <button
          onClick={() => navigate('/')}
          className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 hover:from-indigo-500 hover:to-violet-500 transition-all"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (loadingProject) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Scene Generator</h2>
          <p className="text-sm text-gray-400 mt-1">Split script into visual scenes and generate optimized AI image prompts.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleSaveScenes(scenes, true)}
            disabled={scenes.length === 0}
            className="flex items-center gap-2 rounded-lg bg-gray-800 border border-gray-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
          >
            <CircleStackIcon className="h-5 w-5" />
            Save Scenes
          </button>
          <button
            onClick={handleGenerateScenes}
            disabled={generatingScenes || !script}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/10 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition-all"
          >
            {generatingScenes ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                Generate Scene Plan
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: Script Preview (READ-ONLY/EDITABLE) */}
        <div className="lg:col-span-1 rounded-xl border border-gray-800 bg-[#0d1222]/80 p-6 space-y-4 h-fit">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <VideoCameraIcon className="h-5 w-5 text-gray-400" />
            Input Script
          </h3>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="h-96 w-full rounded-lg border border-gray-800 bg-gray-950/40 p-4 text-sm leading-relaxed text-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none font-sans"
            placeholder="Type or load paraphrased script..."
          />
        </div>

        {/* Right Side: Scenes List */}
        <div className="lg:col-span-2 space-y-6">
          {scenes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-[#0d1222]/10 py-32 text-center">
              <SparklesIcon className="h-12 w-12 text-gray-600 mb-3" />
              <h4 className="text-lg font-bold text-white">No Storyboard Created</h4>
              <p className="text-sm text-gray-400 max-w-xs mt-1">Click "Generate Scene Plan" to structure your script into visual slideshow scenes.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {scenes.map((scene, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-800 bg-[#0d1222]/80 p-6 space-y-4 hover:border-purple-500/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                    <span className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                      Scene {scene.scene_number || index + 1}
                    </span>
                    <input
                      type="text"
                      value={scene.duration || ''}
                      onChange={(e) => updateSceneDetail(index, 'duration', e.target.value)}
                      placeholder="Duration"
                      className="bg-transparent text-xs text-gray-400 border border-gray-700 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-20 text-center"
                    />
                  </div>

                  {/* Narration */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Narration Text</label>
                    <textarea
                      value={scene.narration || ''}
                      onChange={(e) => updateSceneDetail(index, 'narration', e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-gray-950/40 p-3 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      rows={2}
                    />
                  </div>

                  {/* Visual */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Visual Description</label>
                    <textarea
                      value={scene.visual || ''}
                      onChange={(e) => updateSceneDetail(index, 'visual', e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-gray-950/40 p-3 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      rows={2}
                    />
                  </div>

                  {/* AI Image Prompt */}
                  <div className="rounded-lg bg-indigo-950/10 border border-indigo-500/15 p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
                      <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider">AI Image Prompt</label>
                      <button
                        onClick={() => copyToClipboard(scene.image_prompt)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-indigo-400 rounded bg-indigo-500/5 hover:bg-indigo-500/15 border border-indigo-500/20 hover:text-white transition-all cursor-pointer"
                        title="Copy Prompt"
                      >
                        <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                        Copy Prompt
                      </button>
                    </div>
                    <textarea
                      value={scene.image_prompt || ''}
                      onChange={(e) => updateSceneDetail(index, 'image_prompt', e.target.value)}
                      className="w-full rounded border border-indigo-500/20 bg-gray-950/60 p-3 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      rows={3}
                      placeholder="AI visual prompt text..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SceneGenerator;
