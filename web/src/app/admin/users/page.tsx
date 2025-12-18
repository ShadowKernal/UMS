"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Button, IconButton, Chip, Box, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Link from "next/link";

type UserRow = {
  id: string;
  email: string;
  status: string;
  display_name: string;
  created_at: number;
  updated_at: number;
  roles: string[];
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Unable to load users");
      }
      setUsers(data.users || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error?.message || "Failed to delete user");
      }
      // Refresh list
      fetchUsers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  const columns: GridColDef[] = [
    { field: "display_name", headerName: "Name", flex: 1, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1.5, minWidth: 200 },
    {
      field: "roles",
      headerName: "Roles",
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex gap-1 flex-wrap py-1">
          {(params.value as string[]).map((role) => (
            <Chip key={role} label={role} size="small" variant="outlined" color={role === 'ADMIN' ? 'primary' : 'default'} />
          ))}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as string;
        let color: "default" | "success" | "error" | "warning" = "default";
        if (status === "ACTIVE") color = "success";
        if (status === "DELETED") color = "error";
        if (status === "PENDING") color = "warning";
        return <Chip label={status} color={color} size="small" />;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Link href={`/admin/users/${params.row.id}`} passHref>
            <IconButton size="small" color="primary" title="Manage User">
              <EditIcon />
            </IconButton>
          </Link>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id as string)}
            title="Delete User"
            disabled={params.row.status === "DELETED"}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 0, height: 'calc(100vh - 100px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Users
        </Typography>
        <Button variant="contained" color="primary" onClick={fetchUsers}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ height: '100%', width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Box>
    </Box>
  );
}
