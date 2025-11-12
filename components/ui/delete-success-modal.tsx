"use client"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface DeleteSuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DeleteSuccessModal({
  isOpen,
  onClose,
}: DeleteSuccessModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl text-center animate-fade-in">
        <AlertDialogHeader className="flex flex-col items-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto drop-shadow-lg" />
          <AlertDialogTitle className="text-3xl font-extrabold text-gray-900">Deleted Successfully!</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 text-lg">
            The translation request has been successfully deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8 flex justify-center">
          <Button onClick={onClose} className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
            Close
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
