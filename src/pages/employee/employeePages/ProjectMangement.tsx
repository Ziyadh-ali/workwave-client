import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import ProjectFormModal, { ProjectFormValues } from "../modals/ProjectModal";
import { cretaeProjectService, deleteProjectService, getProjectsService, updateProjectService } from "../../../services/user/userService";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";
import ViewMembersModal from "../modals/ViewModal";
import { useLocation, useNavigate } from "react-router-dom";
import ShadTable from "../../../components/TableComponent";
import { useConfirmModal } from "../../../components/useConfirm";
import Sidebar from "../../../components/SidebarComponent";
import { Header } from "../../../components/HeaderComponent";

interface Member {
    _id: string;
    fullName: string;
}

interface Project extends Omit<ProjectFormValues, "members"> {
    _id: string;
    members: Member[];
}



const ProjectManagementPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { confirm, ConfirmModalComponent } = useConfirmModal();
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [membersToShow, setMembersToShow] = useState<Member[]>([]);


    const openModal = (project?: Project) => {
        setSelectedProject(project || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedProject(null);
        setIsModalOpen(false);
    };

    const openMembersModal = (members: Member[]) => {
        setMembersToShow(members);
        setIsMembersModalOpen(true);
    };

    const closeMembersModal = () => {
        setIsMembersModalOpen(false);
        setMembersToShow([]);
    };

    const handleFormSubmit = async (values: ProjectFormValues) => {
        try {
            if (selectedProject) {
                await updateProjectService(selectedProject._id, values);
                navigate("/project")
                enqueueSnackbar("Project updated successfully", { variant: "success" });
            } else {
                const response = await cretaeProjectService(values);
                navigate("/project")
                enqueueSnackbar(response.message, { variant: "success" });
            }

            closeModal();
        } catch (error) {
            enqueueSnackbar(
                error instanceof AxiosError
                    ? error.response?.data?.message
                    : "Error in creating or updating project",
                { variant: "error" }
            );
        }
    };
    const handleDelete = async (id: string) => {
        const response = await deleteProjectService(id);
        enqueueSnackbar(response.message, { variant: "success" });
        navigate("/project");
    };

    useEffect(() => {
        async function fetchProjects() {
            const response = await getProjectsService();
            console.log(response.projects)
            setProjects(response.projects);
        }
        fetchProjects();
    }, [location]);

    // const columns: Column<Project>[] = [
    //     {
    //       header: "Name",
    //       accessor: "name", // ✅ keyof Project
    //       className: "w-[20%]",
    //     },
    //     {
    //       header: "Start",
    //       accessor: (row) => new Date(row.startDate).toDateString(),
    //       className: "w-[15%]",
    //     },
    //     {
    //       header: "End",
    //       accessor: (row) => new Date(row.endDate).toDateString(),
    //       className: "w-[15%]",
    //     },
    //     {
    //       header: "Members",
    //       accessor: (row) => (
    //         <Button variant="outline" onClick={() => openMembersModal(row.members)}>
    //           View Members
    //         </Button>
    //       ),
    //       className: "w-[35%]",
    //     },
    //     {
    //       header: "Actions",
    //       accessor: (row) => (
    //         <div className="flex gap-2 justify-end">
    //           <Button variant="outline" onClick={() => openModal(row)}>Edit</Button>
    //           <Button
    //             variant="outline"
    //             className="text-red-600"
    //             onClick={() => confirmDelete({ id: row._id, name: row.name })}
    //           >
    //             Delete
    //           </Button>
    //         </div>
    //       ),
    //       className: "w-[15%] text-right",
    //     },
    //   ];

    return (
        <div className="flex h-screen">
            <Sidebar role="employee" />
            <div className="flex-1 flex flex-col">
                <div className="p-6 pb-2">
                    <Header role="employee" heading="Project Management" />
                </div>
                <div className="px-6 pb-6">
                    <Card>
                        <CardHeader className="flex  justify-between">
                            <CardTitle className="text-xl">Project Management</CardTitle>
                            <div className="ml-auto">
                                <Button size="sm" className="bg-blue-600 text-white" onClick={() => openModal()}>
                                    Add Project
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="overflow-x-auto px-0">
                            <div className="min-w-full">
                                <ShadTable
                                    columns={[
                                        {
                                          header: "Name",
                                          accessor: (row:Project) => row.name,
                                          className: "w-[20%]",
                                        },
                                        {
                                          header: "Start",
                                          accessor: (row:Project) => new Date(row.startDate).toDateString(),
                                          className: "w-[15%]",
                                        },
                                        {
                                          header: "End",
                                          accessor: (row :Project) => new Date(row.endDate).toDateString(),
                                          className: "w-[15%]",
                                        },
                                        {
                                          header: "Members",
                                          accessor: (row : Project) => (
                                            <Button variant="outline" onClick={() => openMembersModal(row.members)}>
                                              View Members
                                            </Button>
                                          ),
                                          className: "w-[35%]",
                                        },
                                        {
                                          header: "Actions",
                                          accessor: (row : Project) => (
                                            <div className="flex gap-2 justify-end">
                                              <Button variant="outline" onClick={() => openModal(row)}>Edit</Button>
                                              <Button
                                                variant="outline"
                                                className="text-red-600"
                                                onClick={() => confirm({
                                                    title: "Delete Project?",
                                                    message: "Are you sure you want to delete this Project?",
                                                    onConfirm: () => handleDelete(row._id),
                                                })}
                                              >
                                                Delete
                                              </Button>
                                            </div>
                                          ),
                                          className: "w-[15%] text-right",
                                        },
                                      ]}
                                    data={projects}
                                    keyExtractor={(row) => row._id}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal */}
            <ProjectFormModal
                isOpen={isModalOpen}
                initialValues={{
                    name: selectedProject?.name || "",
                    startDate: selectedProject?.startDate ? new Date(selectedProject.startDate) : new Date(),
                    endDate: selectedProject?.endDate ? new Date(selectedProject.endDate) : new Date(),
                    members: selectedProject?.members.map((m) => m._id) || [],
                }}
                onClose={closeModal}
                onSubmit={handleFormSubmit}
                isEdit={!!selectedProject}
            />
            <ConfirmModalComponent/>
            <ViewMembersModal
                isOpen={isMembersModalOpen}
                members={membersToShow}
                onClose={closeMembersModal}
            />
        </div>
    );
};

export default ProjectManagementPage;
