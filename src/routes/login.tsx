// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import { useState } from "react";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { loginUser, registerUser } from "@/lib/api";

// export const Route = createFileRoute("/login")({
//   component: LoginPage,
// });

// function LoginPage() {
//   const navigate = useNavigate();
//   const [mode, setMode] = useState<"login" | "signup">("login");
//   const [loading, setLoading] = useState(false);
//     let submitLabel = mode === "login" ? "Log in" : "Create account";
//     if (loading) submitLabel = "Please wait...";

//     async function handleSubmit(event: { preventDefault: () => void; currentTarget: HTMLFormElement }) {
//     event.preventDefault();
//     const form = new FormData(event.currentTarget);
//     const value = (field: string) => {
//       const entry = form.get(field);
//       return typeof entry === "string" ? entry.trim() : "";
//     };
//     const name = value("name");
//     const email = value("email");
//     const password = form.get("password");
//     const passwordValue = typeof password === "string" ? password : "";

//     if (!email || !passwordValue || (mode === "signup" && !name)) {
//       toast.error("Please complete the required fields.");
//       return;
//     }

//     setLoading(true);
//     try {
//       if (mode === "signup") {
//         await registerUser({ name, email, password: passwordValue });
//         toast.success("Account created");
//       } else {
//         await loginUser({ email, password: passwordValue });
//         toast.success("Logged in");
//       }
//       navigate({ to: "/warm-leads" });
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : "Authentication failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-background p-6">
//       <Card className="w-full max-w-md shadow-none">
//         <CardHeader>
//           <CardTitle className="text-2xl">Welcome to Referral OS</CardTitle>
//           <p className="text-sm text-muted-foreground">
//             Sign in to review your warm network and move from connection to referral faster.
//           </p>
//         </CardHeader>
//         <CardContent>
//           <div className="mb-4 flex gap-2 rounded-md bg-muted p-1">
//             <Button
//               type="button"
//               variant={mode === "login" ? "default" : "ghost"}
//               className="flex-1"
//               onClick={() => setMode("login")}
//             >
//               Log in
//             </Button>
//             <Button
//               type="button"
//               variant={mode === "signup" ? "default" : "ghost"}
//               className="flex-1"
//               onClick={() => setMode("signup")}
//             >
//               Sign up
//             </Button>
//           </div>

//           <form className="space-y-4" onSubmit={handleSubmit}>
//             {mode === "signup" ? (
//               <div className="space-y-2">
//                 <Label htmlFor="name">Full name</Label>
//                 <Input id="name" name="name" placeholder="Alex Rivera" />
//               </div>
//             ) : null}

//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input id="email" name="email" type="email" placeholder="alex@example.com" />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input id="password" name="password" type="password" placeholder="At least 8 chars" />
//             </div>

//             <Button type="submit" className="w-full" disabled={loading}>
//               {submitLabel}
//             </Button>
//           </form>

//         </CardContent>
//       </Card>
//     </div>
//   );
// }
