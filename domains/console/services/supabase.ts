import { useSupabaseClient } from "@/domains/auth/services/supabase";
import type { BlogPost, Project, WorkExperience } from "../types";
import type { UserProfile } from "@/domains/auth/types";

// Blog post services
export const blogService = {
  // Get all blog posts
  async getAllPosts() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, author:profiles(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as BlogPost[];
  },

  // Get a single blog post
  async getPost(id: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, author:profiles(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as BlogPost;
  },

  // Create a new blog post
  async createPost(post: Partial<BlogPost>) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .insert([post])
      .select();

    if (error) throw error;
    return data[0] as BlogPost;
  },

  // Update a blog post
  async updatePost(id: string, post: Partial<BlogPost>) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .update(post)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0] as BlogPost;
  },

  // Delete a blog post
  async deletePost(id: string) {
    const supabase = useSupabaseClient();
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);

    if (error) throw error;
    return true;
  },
};

// Project services
export const projectService = {
  // Get all projects
  async getAllProjects() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Project[];
  },

  // Get a single project
  async getProject(id: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Project;
  },

  // Create a new project
  async createProject(project: Partial<Project>) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .insert([project])
      .select();

    if (error) throw error;
    return data[0] as Project;
  },

  // Update a project
  async updateProject(id: string, project: Partial<Project>) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .update(project)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0] as Project;
  },

  // Delete a project
  async deleteProject(id: string) {
    const supabase = useSupabaseClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) throw error;
    return true;
  },
};

// Work experience services
export const experienceService = {
  // Get all work experiences
  async getAllExperiences() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("work_experiences")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data as WorkExperience[];
  },

  // Get a single work experience
  async getExperience(id: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("work_experiences")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as WorkExperience;
  },

  // Create a new work experience
  async createExperience(experience: Partial<WorkExperience>) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("work_experiences")
      .insert([experience])
      .select();

    if (error) throw error;
    return data[0] as WorkExperience;
  },

  // Update a work experience
  async updateExperience(id: string, experience: Partial<WorkExperience>) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("work_experiences")
      .update(experience)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0] as WorkExperience;
  },

  // Delete a work experience
  async deleteExperience(id: string) {
    const supabase = useSupabaseClient();
    const { error } = await supabase
      .from("work_experiences")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },
};

// User management services
export const userService = {
  // Get all users
  async getAllUsers() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as UserProfile[];
  },

  // Update a user's role
  async updateUserRole(id: string, role: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0] as UserProfile;
  },
};

// Whitelist management services
export const whitelistService = {
  // Get all whitelist entries
  async getAllEntries() {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("whitelist")
      .select("*, added_by:profiles(email)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Add an email to the whitelist
  async addEmail(email: string, adminId: string) {
    const supabase = useSupabaseClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from("whitelist")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      throw new Error("Email is already on the whitelist");
    }

    // Add to whitelist
    const { data, error } = await supabase
      .from("whitelist")
      .insert([{ email, added_by: adminId }])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Remove an email from the whitelist
  async removeEntry(id: string) {
    const supabase = useSupabaseClient();
    const { error } = await supabase.from("whitelist").delete().eq("id", id);

    if (error) throw error;
    return true;
  },

  // Check if a user is on the whitelist
  async checkEmail(email: string) {
    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("whitelist")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;
    return !!data; // Return true if data exists
  },
};
