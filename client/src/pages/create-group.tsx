import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Save, Loader2, Lock, Unlock, UserPlus, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CreateGroupRequest } from "@shared/schema";

export default function CreateGroup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [joinType, setJoinType] = useState<"open" | "invite_only">("open");

  const createMutation = useMutation({
    mutationFn: async (data: CreateGroupRequest) => {
      const response = await apiRequest("POST", "/api/groups", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create group");
      }
      return response.json();
    },
    onSuccess: (group) => {
      toast({
        title: "Groupe créé !",
        description: `Le groupe "${group.name}" a été créé avec succès.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-groups"] });
      navigate(`/groups/${group.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le groupe.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez entrer un nom pour votre groupe.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      badge: badge.trim() || undefined,
      visibility,
      joinType,
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-heading text-3xl font-bold">Créer un Groupe</h1>
        <p className="mt-1 text-muted-foreground">
          Créez votre propre guilde ou clan et commencez à partager des quiz
        </p>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informations du Groupe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name">Nom du Groupe *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Les Champions, Quiz Masters..."
                className="mt-1.5"
                maxLength={50}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {name.length}/50 caractères
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre groupe, ses objectifs..."
                className="mt-1.5"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="badge">Badge/Emoji</Label>
              <Input
                id="badge"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="🏆 ⚔️ 🛡️ 🎯 (emoji ou symbole)"
                className="mt-1.5"
                maxLength={2}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Emoji ou symbole pour représenter votre groupe
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="visibility">Visibilité</Label>
                <Select
                  value={visibility}
                  onValueChange={(v) => setVisibility(v as "public" | "private")}
                >
                  <SelectTrigger className="mt-1.5" id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Privé
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  {visibility === "public" 
                    ? "Visible par tous" 
                    : "Visible uniquement par les membres"}
                </p>
              </div>

              <div>
                <Label htmlFor="joinType">Type d'adhésion</Label>
                <Select
                  value={joinType}
                  onValueChange={(v) => setJoinType(v as "open" | "invite_only")}
                >
                  <SelectTrigger className="mt-1.5" id="joinType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">
                      <div className="flex items-center gap-2">
                        <Unlock className="h-4 w-4" />
                        Ouvert
                      </div>
                    </SelectItem>
                    <SelectItem value="invite_only">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Sur invitation
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  {joinType === "open" 
                    ? "Tout le monde peut rejoindre" 
                    : "Invitation requise"}
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/groups")}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !name.trim()}
                className="flex-1 gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Créer le Groupe
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

