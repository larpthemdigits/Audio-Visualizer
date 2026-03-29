import { useState } from "react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useAdminLogin, useListSongs, useAddSong, useDeleteSong } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, Plus, Trash2, Home, Music, Link as LinkIcon, Loader2, AlertCircle } from "lucide-react";

// Schemas
const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const addSongSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  soundcloudUrl: z.string().url("Must be a valid URL").includes("soundcloud.com", { message: "Must be a SoundCloud URL" }),
});

type LoginForm = z.infer<typeof loginSchema>;
type AddSongForm = z.infer<typeof addSongSchema>;

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      <ParticleBackground />
      
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <LoginView key="login" onLogin={() => setIsAuthenticated(true)} />
        ) : (
          <DashboardView key="dashboard" />
        )}
      </AnimatePresence>
    </div>
  );
}

function LoginView({ onLogin }: { onLogin: () => void }) {
  const loginMutation = useAdminLogin();
  
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" }
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(
      { data },
      {
        onSuccess: () => onLogin(),
        onError: () => form.setError("password", { message: "Incorrect password" })
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative z-10 w-full max-w-sm bg-[#14141c]/80 border border-primary/20 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/50"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-white">Admin Access</h2>
        <p className="text-sm text-[#d8b4fe]/60 mt-1">Enter password to manage songs</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-black/50 border border-primary/30 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-destructive text-sm mt-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-gradient-to-r from-primary to-[#8b5cf6] hover:from-primary hover:to-primary text-white rounded-xl py-3 font-medium transition-all hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex justify-center"
        >
          {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Unlock"}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-[#d8b4fe]/50 hover:text-[#d8b4fe] transition-colors inline-flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5" /> Back to site
        </Link>
      </div>
    </motion.div>
  );
}

function DashboardView() {
  const queryClient = useQueryClient();
  const { data: songs, isLoading } = useListSongs();
  const addMutation = useAddSong();
  const deleteMutation = useDeleteSong();

  const form = useForm<AddSongForm>({
    resolver: zodResolver(addSongSchema),
    defaultValues: { title: "", artist: "", soundcloudUrl: "" }
  });

  const onSubmit = (data: AddSongForm) => {
    addMutation.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
          form.reset();
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this song?")) return;
    deleteMutation.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/songs"] }) }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 w-full max-w-3xl flex flex-col gap-6 py-8"
    >
      <div className="flex items-center justify-between bg-[#14141c]/80 border border-primary/20 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Music className="w-6 h-6 text-primary" /> Song Manager
          </h1>
          <p className="text-sm text-[#d8b4fe]/60 mt-1">Manage the songs that randomly play on your profile.</p>
        </div>
        <Link href="/" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium border border-white/10 transition-colors flex items-center gap-2">
          <Home className="w-4 h-4" /> View Profile
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Add Form */}
        <div className="md:col-span-1 bg-[#14141c]/80 border border-primary/20 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Add Song
          </h2>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#d8b4fe]/70 mb-1.5 block">Title</label>
              <input
                type="text"
                className="w-full bg-black/50 border border-primary/30 rounded-lg px-3 py-2 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="e.g. moonlight"
                {...form.register("title")}
              />
              {form.formState.errors.title && <p className="text-destructive text-xs mt-1">{form.formState.errors.title.message}</p>}
            </div>
            
            <div>
              <label className="text-xs font-medium text-[#d8b4fe]/70 mb-1.5 block">Artist</label>
              <input
                type="text"
                className="w-full bg-black/50 border border-primary/30 rounded-lg px-3 py-2 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="e.g. kali uchis"
                {...form.register("artist")}
              />
              {form.formState.errors.artist && <p className="text-destructive text-xs mt-1">{form.formState.errors.artist.message}</p>}
            </div>
            
            <div>
              <label className="text-xs font-medium text-[#d8b4fe]/70 mb-1.5 block">SoundCloud URL</label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 absolute left-3 top-2.5 text-white/30" />
                <input
                  type="url"
                  className="w-full bg-black/50 border border-primary/30 rounded-lg pl-9 pr-3 py-2 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="https://soundcloud.com/..."
                  {...form.register("soundcloudUrl")}
                />
              </div>
              {form.formState.errors.soundcloudUrl && <p className="text-destructive text-xs mt-1">{form.formState.errors.soundcloudUrl.message}</p>}
            </div>

            <button
              type="submit"
              disabled={addMutation.isPending}
              className="w-full bg-primary/20 hover:bg-primary/30 text-primary-foreground border border-primary/50 rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50 flex justify-center"
            >
              {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add to playlist"}
            </button>
          </form>
        </div>

        {/* Song List */}
        <div className="md:col-span-2 bg-[#14141c]/80 border border-primary/20 rounded-2xl p-6 backdrop-blur-xl min-h-[300px]">
          <h2 className="text-lg font-semibold text-white mb-4">Current Playlist</h2>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 text-[#d8b4fe]/50">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <span className="text-sm">Loading songs...</span>
            </div>
          ) : !songs || songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-primary/20 rounded-xl">
              <Music className="w-8 h-8 text-primary/30 mb-2" />
              <p className="text-sm text-[#d8b4fe]/50">No songs added yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {songs.map((song) => (
                <div key={song.id} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col overflow-hidden pr-4">
                    <span className="text-sm font-medium text-white truncate">{song.title}</span>
                    <span className="text-xs text-[#d8b4fe]/60 truncate">{song.artist}</span>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(song.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-white/30 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
                    title="Remove song"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
