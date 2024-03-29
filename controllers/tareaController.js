import Habitacion from "../models/Habitacion.js";
import Tarea from "../models/Tarea.js";
import Usuario from "../models/Usuario.js";

const agregarTarea = async (req, res) => {
  const userId = req.usuario._id
  const { habitacion } = req.body;
  
  const existeHabitacion = await Habitacion.findById(habitacion);
  const usuario = await Usuario.findById({_id:userId})
  const tareas = await Tarea.find({habitacion})
  if(usuario.premium === false && tareas.length === 5){
    return res.json({msg: "Alcanzo el limite maximo de tareas en este habitacion"})
  }

  if (!existeHabitacion) {
    const error = new Error("Habitacion no existe");
    return res.status(404).json({ msg: error.message });
  }

  if (existeHabitacion.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No tienes los permisos para añadir tareas");
    return res.status(403).json({ msg: error.message });
  }
  try {
    const tareaAlmacenada = await Tarea.create(req.body);
    //Almacenar el ID en el habitacion
    existeHabitacion.tareas.push(tareaAlmacenada._id);
    await existeHabitacion.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

const obtenerTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("habitacion");

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.habitacion.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(403).json({ msg: error.message });
  }
  return res.json(tarea);
};

const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById({_id:id}).populate("habitacion");

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.habitacion.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(403).json({ msg: error.message });
  }

  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;
  tarea.estado = req.body.estado || tarea.estado;
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;
  try {
    const tareaAlmacenada = await tarea.save();
    return res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

const eliminarTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById({_id:id}).populate("habitacion")
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.habitacion.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(403).json({ msg: error.message });
  }

  try {
    await tarea.deleteOne();
    res.json({ msg: "Tarea eliminada satisfactoriamente" });
  } catch (error) {
    console.log(error);
  }
};

const cambiarEstado = async (req, res) => {};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
};
