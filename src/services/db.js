import { db, storage } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function dataURLtoBlob(dataurl) {
  try {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error("Failed to parse data URL to blob", e);
    return null;
  }
}

async function uploadToTmpFiles(blob, fileName) {
  const controller = new AbortController();
  const blobSize = blob.size || 0;
  // Dynamic timeout: 100 KB/s baseline, Min: 15s, Max: 10 mins
  const timeoutDuration = Math.max(15000, Math.min(600000, Math.ceil((blobSize / 102400) * 1000)));
  const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

  try {
    const formData = new FormData();
    formData.append('file', blob, fileName || `upload_${Date.now()}.bin`);
    formData.append('expire', '86400'); // 24 hours

    const res = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    if (res.ok && data.status === 'success' && data.data?.url) {
      const directUrl = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
      console.log("Uploaded successfully to tmpfiles.org fallback:", directUrl);
      return directUrl;
    } else {
      throw new Error(data.error || 'Failed to upload to tmpfiles.org');
    }
  } catch (e) {
    clearTimeout(timeoutId);
    console.error("Failed to upload to tmpfiles.org fallback:", e);
    throw e;
  }
}


export const dbService = {
  // --- MEDIA STORAGE UPLOAD ---
  async uploadFile(fileOrBase64, fileName) {
    let blob = fileOrBase64;
    let name = fileName;

    if (typeof fileOrBase64 === 'string') {
      if (fileOrBase64.startsWith('blob:')) {
        try {
          blob = await fetch(fileOrBase64).then(r => r.blob());
        } catch (fetchErr) {
          console.error("Failed to fetch blob from local URL:", fetchErr);
          return fileOrBase64;
        }
      } else {
        blob = dataURLtoBlob(fileOrBase64);
        if (!blob) return fileOrBase64;
      }
    } else if (fileOrBase64 instanceof File) {
      name = fileOrBase64.name;
    }

    if (!storage) {
      try {
        if (blob) {
          return await uploadToTmpFiles(blob, name);
        }
      } catch (err) {
        console.warn("tmpfiles.org fallback upload failed, using local URL:", err);
      }
      
      if (fileOrBase64 instanceof File) {
        return URL.createObjectURL(fileOrBase64);
      }
      return fileOrBase64;
    }

    try {
      const fileExtension = blob.type?.split('/')[1] || 'bin';
      const finalName = name ? name : `upload_${Date.now()}.${fileExtension}`;
      
      const storageRef = ref(storage, `posts_media/${Date.now()}_${finalName}`);
      
      const uploadPromise = uploadBytes(storageRef, blob).then(async (snapshot) => {
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      });

      // Calculate timeout dynamically based on file size (assuming 100 KB/s upload speed)
      // Min: 20 seconds, Max: 10 minutes (600,000 ms)
      const blobSize = blob.size || 0;
      const timeoutDuration = Math.max(20000, Math.min(600000, Math.ceil((blobSize / 102400) * 1000)));

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Firebase Storage upload timeout")), timeoutDuration)
      );

      const downloadURL = await Promise.race([uploadPromise, timeoutPromise]);
      return downloadURL;
    } catch (e) {
      console.warn("Firebase Storage upload failed or timed out, trying tmpfiles.org fallback:", e);
      try {
        if (blob) {
          return await uploadToTmpFiles(blob, name);
        }
      } catch (fallbackErr) {
        console.error("Firebase Storage and tmpfiles.org fallback both failed:", fallbackErr);
      }
      
      if (fileOrBase64 instanceof File) {
        return URL.createObjectURL(fileOrBase64);
      }
      return typeof fileOrBase64 === 'string' ? fileOrBase64 : '';
    }
  },

  // --- USERS MANAGEMENT ---
  
  async getUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = [];
      querySnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      return usersList;
    } catch (e) {
      console.error("Error reading users from Firestore: ", e);
      return [];
    }
  },

  async updateUserStatus(userId, newStatus) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { status: newStatus });
      return true;
    } catch (e) {
      console.error("Error updating user status in Firestore: ", e);
      return false;
    }
  },

  async updateUserRole(userId, newRole) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      return true;
    } catch (e) {
      console.error("Error updating user role in Firestore: ", e);
      return false;
    }
  },

  async deleteUser(userId) {
    try {
      const userRef = doc(db, "users", userId);
      await deleteDoc(userRef);
      return true;
    } catch (e) {
      console.error("Error deleting user from Firestore: ", e);
      return false;
    }
  },

  // --- POSTS MANAGEMENT ---

  async getPosts() {
    const fallbackGet = () => {
      try {
        const posts = localStorage.getItem('postHistory');
        return posts ? JSON.parse(posts) : [];
      } catch (err) {
        return [];
      }
    };

    try {
      const fetchPromise = getDocs(collection(db, "posts")).then(querySnapshot => {
        const postsList = [];
        querySnapshot.forEach((doc) => {
          postsList.push({ id: doc.id, ...doc.data() });
        });
        return postsList;
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Firestore read timeout")), 30000)
      );

      const result = await Promise.race([fetchPromise, timeoutPromise]);
      return result;
    } catch (e) {
      console.warn("Firestore read failed or timed out, reading from localStorage fallback:", e);
      return fallbackGet();
    }
  },

  async deletePost(postId, platforms = null, deleteLocal = true) {
    const posts = await this.getPosts();
    const targetPost = posts.find(p => String(p.id) === String(postId));
    if (!targetPost) return false;

    const platformsToDelete = platforms || targetPost.platforms || [];

    // 1. Sync-delete from Facebook if selected and exists
    if (platformsToDelete.includes('facebook') && targetPost.fb_post_id) {
      const token = localStorage.getItem('fb_access_token');
      if (token) {
        try {
          console.log(`Sync-deleting FB post: ${targetPost.fb_post_id}`);
          const res = await fetch(`https://graph.facebook.com/v18.0/${targetPost.fb_post_id}?access_token=${token}`, {
            method: 'DELETE'
          });
          const data = await res.json();
          if (res.ok) {
            console.log("Deleted post from Facebook Page API successfully", data);
          } else {
            console.error("Facebook API delete error:", data);
          }
        } catch (err) {
          console.error("Failed to call Facebook delete API:", err);
        }
      }
    }

    // 2. Sync-delete from Threads if selected and exists
    if (platformsToDelete.includes('threads') && targetPost.threads_post_id) {
      const token = localStorage.getItem('threads_access_token');
      if (token) {
        try {
          console.log(`Sync-deleting Threads post: ${targetPost.threads_post_id}`);
          const res = await fetch('/api/threads-proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              path: `/${targetPost.threads_post_id}`,
              targetMethod: 'DELETE',
              params: {
                access_token: token
              }
            })
          });
          const data = await res.json();
          if (res.ok) {
            console.log("Deleted post from Threads API successfully", data);
          } else {
            console.error("Threads API delete error:", data);
          }
        } catch (err) {
          console.error("Failed to call Threads delete API:", err);
        }
      }
    }

    // 3. Local/Firestore update or delete
    if (deleteLocal) {
      // Keep local storage fallback in sync by deleting the post there too
      try {
        const localPosts = localStorage.getItem('postHistory');
        if (localPosts) {
          const parsed = JSON.parse(localPosts);
          const filtered = parsed.filter(p => String(p.id) !== String(postId));
          localStorage.setItem('postHistory', JSON.stringify(filtered));
        }
      } catch (err) {
        console.error("Failed to delete post from localStorage:", err);
      }

      try {
        const postRef = doc(db, "posts", postId);
        await deleteDoc(postRef);
        return true;
      } catch (e) {
        console.error("Error deleting post from Firestore: ", e);
        return false;
      }
    } else {
      // Just update the post to remove selected platforms and their post IDs
      const remainingPlatforms = (targetPost.platforms || []).filter(p => !platformsToDelete.includes(p));
      const updatedPostData = {
        ...targetPost,
        platforms: remainingPlatforms
      };
      if (platformsToDelete.includes('facebook')) {
        delete updatedPostData.fb_post_id;
      }
      if (platformsToDelete.includes('threads')) {
        delete updatedPostData.threads_post_id;
      }

      // Update in localStorage fallback
      try {
        const localPosts = localStorage.getItem('postHistory');
        if (localPosts) {
          const parsed = JSON.parse(localPosts);
          const idx = parsed.findIndex(p => String(p.id) === String(postId));
          if (idx !== -1) {
            parsed[idx] = updatedPostData;
            localStorage.setItem('postHistory', JSON.stringify(parsed));
          }
        }
      } catch (err) {
        console.error("Failed to update post in localStorage:", err);
      }

      // Update in Firestore
      try {
        const postRef = doc(db, "posts", postId);
        const { updateDoc, deleteField } = await import('firebase/firestore');
        const updateFields = {
          platforms: remainingPlatforms
        };
        if (platformsToDelete.includes('facebook')) {
          updateFields.fb_post_id = deleteField();
        }
        if (platformsToDelete.includes('threads')) {
          updateFields.threads_post_id = deleteField();
        }
        await updateDoc(postRef, updateFields);
        return true;
      } catch (e) {
        console.error("Error updating post in Firestore: ", e);
        return false;
      }
    }
  },

  async addPost(postData) {
    const fallbackMockAdd = async () => {
      let mockPosts = [];
      try {
        const posts = localStorage.getItem('postHistory');
        mockPosts = posts ? JSON.parse(posts) : [];
      } catch (err) {
        console.error("Failed to parse mock posts:", err);
      }

      // Deep copy and strip huge Base64 data strings to prevent local storage quota limit crash
      const cleanedPostData = JSON.parse(JSON.stringify(postData));
      if (cleanedPostData.media && Array.isArray(cleanedPostData.media)) {
        cleanedPostData.media = cleanedPostData.media.map(item => {
          if (item.url && item.url.startsWith('data:')) {
            const isVideo = item.type && item.type.startsWith('video');
            return {
              ...item,
              url: isVideo 
                ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'
            };
          }
          return item;
        });
      }

      const newPost = { id: Date.now(), ...cleanedPostData };
      mockPosts.push(newPost);
      
      try {
        localStorage.setItem('postHistory', JSON.stringify(mockPosts));
      } catch (quotaError) {
        console.warn("localStorage quota exceeded on postHistory! Trimming post history to fit.", quotaError);
        if (mockPosts.length > 5) {
          mockPosts = mockPosts.slice(-5);
        } else {
          mockPosts = [newPost];
        }
        try {
          localStorage.setItem('postHistory', JSON.stringify(mockPosts));
        } catch (retryError) {
          console.error("Failed to save post to localStorage even after trimming:", retryError);
          // If it still fails, try clearing localStorage of old massive files
          localStorage.removeItem('postHistory');
          try {
            localStorage.setItem('postHistory', JSON.stringify([newPost]));
          } catch (e) {
            console.error("Failed completely to write to localStorage:", e);
          }
        }
      }
      return newPost;
    };

    try {
      const addPromise = addDoc(collection(db, "posts"), postData).then(docRef => ({
        id: docRef.id,
        ...postData
      }));

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Firestore write timeout")), 30000)
      );

      const result = await Promise.race([addPromise, timeoutPromise]);
      return result;
    } catch (e) {
      console.warn("Firestore write failed or timed out, falling back to localStorage database:", e);
      return fallbackMockAdd();
    }
  }
};
